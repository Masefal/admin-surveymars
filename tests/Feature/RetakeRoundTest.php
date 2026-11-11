<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Option;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentClass;
use App\Models\Subject;
use App\Models\User;
use App\Services\MaterialPerformance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Permintaan wali kelas: saat mengulang kuis, yang muncul hanya soal yang masih salah di ronde sebelumnya.
 */
class RetakeRoundTest extends TestCase
{
    use RefreshDatabase;

    private Student $siswa;
    private Quiz $quiz;
    private Material $egrang;
    private Material $engklek;

    protected function setUp(): void
    {
        parent::setUp();

        $guru = User::factory()->create(['role' => 'guru']);
        $kelas = StudentClass::create(['name' => 'Kelas 4']);
        $mapel = Subject::create(['name' => 'SBdP']);
        $this->egrang = Material::create(['subject_id' => $mapel->id, 'name' => 'Egrang']);
        $this->engklek = Material::create(['subject_id' => $mapel->id, 'name' => 'Engklek']);
        $this->siswa = Student::create(['nisn' => '111', 'name' => 'Budi', 'student_class_id' => $kelas->id]);

        $this->quiz = Quiz::create([
            'user_id' => $guru->id, 'subject_id' => $mapel->id, 'student_class_id' => $kelas->id,
            'title' => 'Latihan', 'share_code' => 'RONDE', 'status' => 'active', 'approved_at' => now(), 'time_limit_minutes' => 30, 'max_attempts' => 3,
        ]);

        // 4 soal: 2 egrang, 2 engklek. Opsi pertama selalu kunci.
        foreach ([$this->egrang, $this->egrang, $this->engklek, $this->engklek] as $i => $material) {
            $q = Question::create(['quiz_id' => $this->quiz->id, 'material_id' => $material->id, 'question_text' => "Soal $i", 'explanation' => "Pembahasan $i", 'type' => 'multiple_choice', 'points' => 10]);
            Option::create(['question_id' => $q->id, 'option_text' => 'Benar', 'is_correct' => true]);
            Option::create(['question_id' => $q->id, 'option_text' => 'Salah', 'is_correct' => false]);
        }
        $this->quiz->load('questions.options');
    }

    private function url(string $path = ''): string
    {
        return '/api/student/quiz/RONDE'.$path;
    }

    private function identity(): array
    {
        return ['student_id' => $this->siswa->id, 'nisn' => '111'];
    }

    /** @param array<int,bool> $correctByIndex jawaban benar/salah per indeks soal (urutan quiz) */
    private function submit(array $correctByIndex)
    {
        $answers = collect($correctByIndex)->map(function ($correct, $index) {
            $q = $this->quiz->questions[$index];

            return ['question_id' => $q->id, 'option_id' => $q->options[$correct ? 0 : 1]->id];
        })->values()->all();

        return $this->postJson($this->url('/submit'), $this->identity() + ['time_spent_seconds' => 30, 'answers' => $answers]);
    }

    public function test_nis_hanya_boleh_angka_dan_titik(): void
    {
        $this->postJson($this->url('/verify'), ['student_id' => $this->siswa->id, 'nisn' => '11a'])
            ->assertUnprocessable()->assertJsonValidationErrors('nisn');

        $guru = User::where('role', 'guru')->first();
        \Laravel\Sanctum\Sanctum::actingAs($guru);
        $kelasId = $this->siswa->student_class_id;

        $this->postJson('/api/students', ['name' => 'A', 'nisn' => '12345abcde', 'student_class_id' => $kelasId])
            ->assertUnprocessable()->assertJsonValidationErrors('nisn');
        $this->postJson('/api/students', ['name' => 'A', 'nisn' => '2324..01', 'student_class_id' => $kelasId])
            ->assertUnprocessable()->assertJsonValidationErrors('nisn');
        $this->postJson('/api/students', ['name' => 'A', 'nisn' => '2324.01.003', 'student_class_id' => $kelasId])
            ->assertCreated();
        // NIS disimpan sebagai teks, apa adanya (titik dan nol di depan tidak hilang)
        $this->assertDatabaseHas('students', ['nisn' => '2324.01.003']);
        // NIS yang sama tanpa titik dianggap duplikat
        $this->postJson('/api/students', ['name' => 'B', 'nisn' => '232401003', 'student_class_id' => $kelasId])
            ->assertUnprocessable()->assertJsonValidationErrors('nisn');
    }

    public function test_siswa_boleh_mengetik_nis_dengan_atau_tanpa_titik(): void
    {
        $this->siswa->update(['nisn' => '2324.01.003']);

        $this->postJson($this->url('/verify'), ['student_id' => $this->siswa->id, 'nisn' => '232401003'])->assertOk();
        $this->postJson($this->url('/verify'), ['student_id' => $this->siswa->id, 'nisn' => '2324.01.003'])->assertOk();
        $this->postJson($this->url('/verify'), ['student_id' => $this->siswa->id, 'nisn' => '2324.01.004'])
            ->assertUnprocessable()->assertJsonValidationErrors('nisn');
    }

    public function test_ronde_ulang_hanya_berisi_soal_yang_masih_salah(): void
    {
        // Ronde 1: semua soal
        $this->postJson($this->url('/verify'), $this->identity())
            ->assertOk()->assertJsonPath('round', 1)->assertJsonCount(4, 'questions');

        // Benar soal 0 & 1 (egrang), salah soal 2 & 3 (engklek)
        $this->submit([0 => true, 1 => true, 2 => false, 3 => false])
            ->assertCreated()
            ->assertJsonPath('result.score', 50)
            ->assertJsonPath('remaining_wrong', 2)
            ->assertJsonPath('can_retry', true);

        // Ronde 2: hanya 2 soal engklek, tanpa kunci jawaban
        $res = $this->postJson($this->url('/verify'), $this->identity())
            ->assertOk()->assertJsonPath('round', 2)->assertJsonCount(2, 'questions');
        $this->assertEqualsCanonicalizing(
            [$this->quiz->questions[2]->id, $this->quiz->questions[3]->id],
            collect($res->json('questions'))->pluck('id')->all()
        );
        $this->assertArrayNotHasKey('is_correct', $res->json('questions.0.options.0'));

        // Jawaban untuk soal yang sudah benar diabaikan server; soal 2 benar, soal 3 masih salah
        $this->submit([0 => false, 2 => true, 3 => false])
            ->assertCreated()
            ->assertJsonPath('round', 2)
            ->assertJsonPath('round_question_count', 2)
            ->assertJsonPath('result.score', 75)
            ->assertJsonPath('remaining_wrong', 1);

        // Ronde 3: tinggal soal 3
        $this->postJson($this->url('/verify'), $this->identity())
            ->assertOk()->assertJsonPath('round', 3)->assertJsonCount(1, 'questions');
        $this->submit([3 => true])->assertCreated()->assertJsonPath('result.score', 100)->assertJsonPath('can_retry', false);

        // Semua sudah benar: tidak perlu mengulang
        $this->postJson($this->url('/verify'), $this->identity())->assertOk()->assertJsonPath('completed', true);
    }

    public function test_kunci_soal_yang_salah_disembunyikan_selama_masih_ada_ronde(): void
    {
        $res = $this->submit([0 => true, 1 => true, 2 => false, 3 => false])->assertCreated();
        $review = collect($res->json('review.questions'))->keyBy('id');

        $wrong = $review[$this->quiz->questions[2]->id];
        $this->assertTrue($wrong['key_hidden']);
        $this->assertNull($wrong['explanation']);
        $this->assertNull($wrong['options'][0]['is_correct']);

        $right = $review[$this->quiz->questions[0]->id];
        $this->assertFalse($right['key_hidden']);
        $this->assertSame('Pembahasan 0', $right['explanation']);
    }

    public function test_kunci_ditampilkan_saat_kesempatan_habis(): void
    {
        $this->quiz->update(['max_attempts' => 1]);

        $res = $this->submit([0 => true, 1 => true, 2 => false, 3 => false])->assertCreated()->assertJsonPath('can_retry', false);
        $wrong = collect($res->json('review.questions'))->firstWhere('id', $this->quiz->questions[2]->id);

        $this->assertFalse($wrong['key_hidden']);
        $this->assertSame('Pembahasan 2', $wrong['explanation']);
    }

    private function performance(): \Illuminate\Support\Collection
    {
        return collect(app(MaterialPerformance::class)->forStudents([$this->siswa->id])[$this->siswa->id])->keyBy('material');
    }

    public function test_ronde_ulang_tidak_menghapus_tanda_materi_lemah(): void
    {
        $this->submit([0 => true, 1 => true, 2 => false, 3 => false]);
        $this->assertSame(0, $this->performance()['Engklek']['percent']);

        // Ronde 2 benar semua (bisa jadi hasil menebak/eliminasi) -> tanda lemah tetap ada
        $this->submit([2 => true, 3 => true]);
        $after = $this->performance();
        $this->assertSame(0, $after['Engklek']['percent']);
        $this->assertTrue($after['Engklek']['needs_attention']);
        $this->assertSame(100, $after['Egrang']['percent']);
    }

    public function test_kuis_baru_yang_lulus_menghapus_tanda_materi_lemah(): void
    {
        $this->submit([0 => true, 1 => true, 2 => false, 3 => false]);
        $this->assertTrue($this->performance()['Engklek']['needs_attention']);

        // Kuis remedial baru khusus engklek dengan soal berbeda, dijawab benar
        $remedial = Quiz::create([
            'user_id' => $this->quiz->user_id, 'subject_id' => $this->quiz->subject_id, 'student_class_id' => $this->quiz->student_class_id,
            'target_student_id' => $this->siswa->id, 'title' => 'Remedial Engklek', 'share_code' => 'REMED', 'status' => 'active', 'approved_at' => now(), 'time_limit_minutes' => 30,
        ]);
        $q = Question::create(['quiz_id' => $remedial->id, 'material_id' => $this->engklek->id, 'question_text' => 'Engklek baru', 'type' => 'multiple_choice', 'points' => 10]);
        $benar = Option::create(['question_id' => $q->id, 'option_text' => 'Benar', 'is_correct' => true]);
        Option::create(['question_id' => $q->id, 'option_text' => 'Salah', 'is_correct' => false]);

        $this->postJson('/api/student/quiz/REMED/submit', $this->identity() + [
            'time_spent_seconds' => 10, 'answers' => [['question_id' => $q->id, 'option_id' => $benar->id]],
        ])->assertCreated();

        $after = $this->performance();
        $this->assertSame(100, $after['Engklek']['percent']);
        $this->assertFalse($after['Engklek']['needs_attention']);
        // Materi lain tetap memakai kuis terakhir yang memuatnya
        $this->assertSame(100, $after['Egrang']['percent']);
    }
}
