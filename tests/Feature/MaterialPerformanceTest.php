<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentClass;
use App\Models\StudentResult;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MaterialPerformanceTest extends TestCase
{
    use RefreshDatabase;

    private User $guru;
    private User $ortu;
    private Student $anak;
    private Subject $mapel;
    private Material $egrang;
    private Material $engklek;
    private Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->ortu = User::factory()->create(['role' => 'orang_tua']);
        $kelas = StudentClass::create(['name' => 'Kelas 4']);
        $this->mapel = Subject::create(['name' => 'SBdP']);
        $this->egrang = Material::create(['subject_id' => $this->mapel->id, 'name' => 'Egrang']);
        $this->engklek = Material::create(['subject_id' => $this->mapel->id, 'name' => 'Engklek']);
        $this->anak = Student::create(['nisn' => '111', 'name' => 'Budi', 'student_class_id' => $kelas->id, 'parent_id' => $this->ortu->id]);

        $this->quiz = Quiz::create([
            'user_id' => $this->guru->id, 'subject_id' => $this->mapel->id, 'student_class_id' => $kelas->id,
            'title' => 'Latihan', 'share_code' => 'ABCDE', 'status' => 'active', 'time_limit_minutes' => 30,
        ]);

        // Egrang: 2 soal benar semua; Engklek: 1 dari 2 benar; satu soal tanpa materi
        $answers = [];
        foreach ([[$this->egrang, true], [$this->egrang, true], [$this->engklek, true], [$this->engklek, false], [null, false]] as $i => [$material, $correct]) {
            $q = Question::create(['quiz_id' => $this->quiz->id, 'material_id' => $material?->id, 'question_text' => "Soal $i", 'type' => 'multiple_choice', 'points' => 10]);
            $answers[] = ['question_id' => $q->id, 'question_text' => $q->question_text, 'is_correct' => $correct];
        }

        StudentResult::create([
            'quiz_id' => $this->quiz->id, 'student_id' => $this->anak->id, 'student_name' => 'Budi',
            'score' => 60, 'correct_answers' => 3, 'wrong_answers' => 2, 'answers_data' => $answers,
        ]);
    }

    public function test_kelola_siswa_menampilkan_performa_dan_materi_perlu_perhatian(): void
    {
        Sanctum::actingAs($this->guru);

        $student = $this->getJson('/api/students')->assertOk()->json('0');
        $byName = collect($student['material_performance'])->keyBy('material');

        $this->assertSame(100, $byName['Egrang']['percent']);
        $this->assertSame(50, $byName['Engklek']['percent']);
        // Soal tanpa materi dikelompokkan memakai judul kuis
        $this->assertSame(0, $byName['Latihan']['percent']);
        $this->assertEqualsCanonicalizing(['Engklek', 'Latihan'], collect($student['needs_attention'])->pluck('material')->all());
    }

    public function test_orang_tua_melihat_performa_per_materi_anaknya(): void
    {
        Sanctum::actingAs($this->ortu);

        $res = $this->getJson('/api/parent/linked-student')->assertOk();
        $this->assertContains('Engklek', collect($res->json('needs_attention'))->pluck('material'));
    }

    public function test_hanya_guru_yang_bisa_menambah_materi_dan_nama_unik_per_mapel(): void
    {
        Sanctum::actingAs($this->ortu);
        $this->postJson('/api/master-data/materials', ['subject_id' => $this->mapel->id, 'name' => 'Ular Naga'])->assertForbidden();

        Sanctum::actingAs($this->guru);
        $this->postJson('/api/master-data/materials', ['subject_id' => $this->mapel->id, 'name' => 'Ular Naga', 'description' => 'Kisi-kisi'])->assertCreated();
        $this->postJson('/api/master-data/materials', ['subject_id' => $this->mapel->id, 'name' => 'Egrang'])->assertUnprocessable();
    }

    public function test_generate_wajib_memilih_materi_jika_mapel_punya_materi(): void
    {
        Sanctum::actingAs($this->guru);

        $this->postJson('/api/generate-quiz', [
            'mapel' => 'SBdP', 'subject_id' => $this->mapel->id, 'kelas' => 'Kelas 4',
            'topik' => 'Latihan', 'jumlah_soal' => 5,
        ])->assertStatus(422)->assertJsonFragment(['error' => 'Pilih minimal satu materi supaya hasil kuis bisa dianalisis per materi.']);
    }

    public function test_simpan_kuis_menyimpan_materi_per_soal(): void
    {
        Sanctum::actingAs($this->guru);

        $this->postJson('/api/quizzes', [
            'quizInfo' => ['subject_id' => $this->mapel->id, 'student_class_id' => $this->anak->student_class_id, 'topik' => 'Engklek'],
            'questions' => [[
                'question_text' => 'Engklek dimainkan dengan cara?',
                'material_id' => $this->engklek->id,
                'options' => [['option_text' => 'Melompat', 'is_correct' => true], ['option_text' => 'Merangkak', 'is_correct' => false]],
            ]],
        ])->assertCreated();

        $this->assertDatabaseHas('questions', ['question_text' => 'Engklek dimainkan dengan cara?', 'material_id' => $this->engklek->id]);
    }
}
