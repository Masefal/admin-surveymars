<?php

namespace Tests\Feature;

use App\Models\Option;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentClass;
use App\Models\StudentResult;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $guru;
    private User $guruLain;
    private User $ortu;
    private User $ortuLain;
    private StudentClass $kelas1;
    private StudentClass $kelas2;
    private Subject $mapel;
    private Student $anak;
    private Student $anakLain;
    private Student $temanSekelas;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->guruLain = User::factory()->create(['role' => 'guru']);
        $this->ortu = User::factory()->create(['role' => 'orang_tua']);
        $this->ortuLain = User::factory()->create(['role' => 'orang_tua']);

        $this->kelas1 = StudentClass::create(['name' => 'Kelas 1']);
        $this->kelas2 = StudentClass::create(['name' => 'Kelas 2']);
        $this->mapel = Subject::create(['name' => 'Matematika']);

        $this->anak = Student::create(['nisn' => '111', 'name' => 'Budi Santoso', 'student_class_id' => $this->kelas1->id, 'parent_id' => $this->ortu->id]);
        $this->temanSekelas = Student::create(['nisn' => '222', 'name' => 'Siti', 'student_class_id' => $this->kelas1->id]);
        $this->anakLain = Student::create(['nisn' => '333', 'name' => 'Andi', 'student_class_id' => $this->kelas2->id, 'parent_id' => $this->ortuLain->id]);
    }

    private function makeQuiz(User $creator, array $attributes = []): Quiz
    {
        $quiz = Quiz::create(array_merge([
            'user_id' => $creator->id,
            'subject_id' => $this->mapel->id,
            'student_class_id' => $this->kelas1->id,
            'title' => 'Kuis ' . Str::random(4),
            'share_code' => strtoupper(Str::random(5)),
            'status' => 'active',
            'time_limit_minutes' => 30,
        ], $attributes));

        foreach ([['2+2', '4', '5'], ['3+3', '6', '7']] as [$text, $correct, $wrong]) {
            $question = Question::create(['quiz_id' => $quiz->id, 'question_text' => $text, 'explanation' => 'Rahasia', 'type' => 'multiple_choice', 'points' => 10]);
            Option::create(['question_id' => $question->id, 'option_text' => $correct, 'is_correct' => true]);
            Option::create(['question_id' => $question->id, 'option_text' => $wrong, 'is_correct' => false]);
        }

        return $quiz->load('questions.options');
    }

    private function quizPayload(array $quizInfo): array
    {
        return [
            'quizInfo' => array_merge(['subject_id' => $this->mapel->id, 'topik' => 'Pecahan'], $quizInfo),
            'questions' => [[
                'question_text' => '1/2 + 1/2 = ?',
                'explanation' => 'Satu',
                'options' => [
                    ['option_text' => '1', 'is_correct' => true],
                    ['option_text' => '2', 'is_correct' => false],
                ],
            ]],
        ];
    }

    public function test_register_selalu_membuat_akun_orang_tua(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Penyusup', 'email' => 'x@contoh.com', 'password' => 'rahasia123', 'role' => 'guru',
        ])->assertCreated()->assertJsonPath('user.role', 'orang_tua');
    }

    public function test_orang_tua_tidak_bisa_memakai_fitur_khusus_guru(): void
    {
        Sanctum::actingAs($this->ortu);

        $this->postJson('/api/master-data/subjects', ['name' => 'IPA'])->assertForbidden();
        $this->deleteJson('/api/master-data/classes/' . $this->kelas1->id)->assertForbidden();
        $this->postJson('/api/students', ['name' => 'X', 'nisn' => '999', 'student_class_id' => $this->kelas1->id])->assertForbidden();
        $this->getJson('/api/dashboard-stats')->assertForbidden();

        $this->assertDatabaseHas('student_classes', ['id' => $this->kelas1->id]);
    }

    public function test_orang_tua_hanya_melihat_anaknya_sendiri(): void
    {
        Sanctum::actingAs($this->ortu);

        $this->getJson('/api/students?all=true')
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $this->anak->id);

        $this->getJson('/api/students/' . $this->anak->id . '/report')->assertOk();
        $this->getJson('/api/students/' . $this->anakLain->id . '/report')->assertForbidden();
    }

    public function test_guru_melihat_semua_siswa_dan_rapor(): void
    {
        Sanctum::actingAs($this->guru);

        $this->getJson('/api/students')->assertOk()->assertJsonCount(3);
        $this->getJson('/api/students/' . $this->anakLain->id . '/report')->assertOk();
    }

    public function test_daftar_kuis_orang_tua_sesuai_anaknya(): void
    {
        $kuisKelasAnak = $this->makeQuiz($this->guru);
        $kuisPersonalAnak = $this->makeQuiz($this->guru, ['target_student_id' => $this->anak->id]);
        $kuisPersonalTeman = $this->makeQuiz($this->guru, ['target_student_id' => $this->temanSekelas->id]);
        $kuisKelasLain = $this->makeQuiz($this->guru, ['student_class_id' => $this->kelas2->id]);

        Sanctum::actingAs($this->ortu);
        $ids = collect($this->getJson('/api/quizzes')->assertOk()->json())->pluck('id');

        $this->assertEqualsCanonicalizing([$kuisKelasAnak->id, $kuisPersonalAnak->id], $ids->all());
        $this->getJson('/api/quizzes/' . $kuisPersonalTeman->id)->assertForbidden();
        $this->getJson('/api/quizzes/' . $kuisKelasLain->id)->assertForbidden();

        Sanctum::actingAs($this->guru);
        $this->getJson('/api/quizzes')->assertOk()->assertJsonCount(4);
    }

    public function test_detail_kuis_untuk_orang_tua_hanya_berisi_nilai_anaknya(): void
    {
        $quiz = $this->makeQuiz($this->guru);
        foreach ([$this->anak, $this->temanSekelas] as $student) {
            StudentResult::create(['quiz_id' => $quiz->id, 'student_id' => $student->id, 'student_name' => $student->name, 'score' => 50]);
        }

        Sanctum::actingAs($this->ortu);
        $this->getJson('/api/quizzes/' . $quiz->id)
            ->assertOk()
            ->assertJsonCount(1, 'student_results')
            ->assertJsonPath('student_results.0.student_id', $this->anak->id)
            ->assertJsonPath('can_manage', false);
    }

    public function test_kuis_hanya_bisa_diubah_pembuatnya(): void
    {
        $quiz = $this->makeQuiz($this->guru);

        Sanctum::actingAs($this->guruLain);
        $this->deleteJson('/api/quizzes/' . $quiz->id)->assertForbidden();
        $this->putJson('/api/quizzes/' . $quiz->id . '/status')->assertForbidden();
        $this->deleteJson('/api/questions/' . $quiz->questions[0]->id)->assertForbidden();

        Sanctum::actingAs($this->guru);
        $this->deleteJson('/api/quizzes/' . $quiz->id)->assertOk();
    }

    public function test_edit_soal_mempertahankan_pembahasan(): void
    {
        $quiz = $this->makeQuiz($this->guru);
        $question = $quiz->questions[0];

        Sanctum::actingAs($this->guru);
        $this->putJson('/api/questions/' . $question->id, [
            'question_text' => '2+2 = ?',
            'options' => [['option_text' => '4', 'is_correct' => true], ['option_text' => '3', 'is_correct' => false]],
        ])->assertOk();

        $this->assertSame('Rahasia', $question->fresh()->explanation);
    }

    public function test_orang_tua_hanya_bisa_membuat_kuis_personal_untuk_anaknya(): void
    {
        Sanctum::actingAs($this->ortu);

        $this->postJson('/api/quizzes', $this->quizPayload(['target_student_id' => $this->temanSekelas->id]))
            ->assertUnprocessable();
        $this->postJson('/api/quizzes', $this->quizPayload(['student_class_id' => $this->kelas1->id]))
            ->assertUnprocessable();

        $this->postJson('/api/quizzes', $this->quizPayload(['target_student_id' => $this->anak->id, 'student_class_id' => $this->kelas2->id]))
            ->assertCreated()
            ->assertJsonPath('quiz.target_student_id', $this->anak->id)
            ->assertJsonPath('quiz.student_class_id', $this->kelas1->id);
    }

    public function test_orang_tua_tidak_bisa_generate_untuk_anak_orang_lain(): void
    {
        Sanctum::actingAs($this->ortu);

        $this->postJson('/api/generate-quiz', [
            'mapel' => 'Matematika', 'kelas' => 'Kelas 2', 'topik' => 'Pecahan', 'jumlah_soal' => 5, 'student_id' => $this->anakLain->id,
        ])->assertForbidden();
    }

    public function test_personalisasi_hanya_memakai_kesalahan_di_mapel_yang_sama(): void
    {
        $agama = Subject::create(['name' => 'Agama Islam']);
        $kuisMtk = $this->makeQuiz($this->guru);
        $kuisAgama = $this->makeQuiz($this->guru, ['subject_id' => $agama->id]);

        StudentResult::create(['quiz_id' => $kuisMtk->id, 'student_id' => $this->anak->id, 'student_name' => 'Budi', 'score' => 0,
            'answers_data' => [['question_text' => 'SOAL-MTK-SALAH', 'is_correct' => false]]]);
        StudentResult::create(['quiz_id' => $kuisAgama->id, 'student_id' => $this->anak->id, 'student_name' => 'Budi', 'score' => 0,
            'answers_data' => [['question_text' => 'SOAL-AGAMA-SALAH', 'is_correct' => false]]]);

        config(['services.gemini.api_key' => 'kunci-uji']);
        $soal = [['question_text' => 'Rukun iman ada berapa?', 'options' => [['option_text' => '6', 'is_correct' => true], ['option_text' => '5', 'is_correct' => false]]]];
        \Illuminate\Support\Facades\Http::fake(['*' => \Illuminate\Support\Facades\Http::response([
            'candidates' => [['finishReason' => 'STOP', 'content' => ['parts' => [['text' => json_encode($soal)]]]]],
        ])]);

        Sanctum::actingAs($this->guru);
        $this->postJson('/api/generate-quiz', [
            'mapel' => 'Agama Islam', 'subject_id' => $agama->id, 'kelas' => 'Kelas 1', 'topik' => 'Rukun Iman', 'jumlah_soal' => 1, 'student_id' => $this->anak->id,
        ])->assertOk();

        \Illuminate\Support\Facades\Http::assertSent(function ($request) {
            $prompt = $request['contents'][0]['parts'][0]['text'];

            return str_contains($prompt, 'SOAL-AGAMA-SALAH') && ! str_contains($prompt, 'SOAL-MTK-SALAH')
                && $request->hasHeader('x-goog-api-key') && ! str_contains($request->url(), 'key=');
        });
    }

    public function test_guru_bisa_membuat_kuis_kelas_dan_kuis_personal(): void
    {
        Sanctum::actingAs($this->guru);

        $this->postJson('/api/quizzes', $this->quizPayload(['student_class_id' => $this->kelas2->id]))
            ->assertCreated()->assertJsonPath('quiz.target_student_id', null);

        $this->postJson('/api/quizzes', $this->quizPayload(['target_student_id' => $this->temanSekelas->id]))
            ->assertCreated()->assertJsonPath('quiz.target_student_id', $this->temanSekelas->id);
    }

    public function test_soal_wajib_punya_tepat_satu_kunci_jawaban(): void
    {
        Sanctum::actingAs($this->guru);
        $payload = $this->quizPayload(['student_class_id' => $this->kelas1->id]);
        $payload['questions'][0]['options'][1]['is_correct'] = true;

        $this->postJson('/api/quizzes', $payload)->assertUnprocessable();
    }

    public function test_menautkan_anak_butuh_nama_yang_cocok(): void
    {
        $siswaBaru = Student::create(['nisn' => '444', 'name' => 'Rina Putri', 'student_class_id' => $this->kelas1->id]);
        Sanctum::actingAs($this->ortu);

        $this->postJson('/api/parent/link', ['nisn' => '444', 'name' => 'Orang Lain'])->assertNotFound();
        $this->postJson('/api/parent/link', ['nisn' => '444', 'name' => '  rina   putri '])->assertOk();
        $this->assertSame($this->ortu->id, $siswaBaru->fresh()->parent_id);

        $this->getJson('/api/parent/linked-student')->assertOk()->assertJsonCount(2, 'students');
    }

    public function test_portal_siswa_tidak_membocorkan_kunci_jawaban(): void
    {
        $quiz = $this->makeQuiz($this->guru);

        $response = $this->getJson('/api/student/quiz/' . $quiz->share_code)->assertOk();

        $this->assertStringNotContainsString('is_correct', $response->getContent());
        $this->assertStringNotContainsString('Rahasia', $response->getContent());
        $this->assertStringNotContainsString('nisn', $response->getContent());
    }

    public function test_kuis_personal_hanya_menampilkan_dan_menerima_siswa_target(): void
    {
        $quiz = $this->makeQuiz($this->ortu, ['target_student_id' => $this->anak->id]);

        $this->getJson('/api/student/quiz/' . $quiz->share_code)
            ->assertOk()->assertJsonCount(1, 'students')->assertJsonPath('students.0.id', $this->anak->id);

        $this->postJson('/api/student/quiz/' . $quiz->share_code . '/verify', ['student_id' => $this->temanSekelas->id, 'nisn' => '222'])
            ->assertUnprocessable();
        $this->postJson('/api/student/quiz/' . $quiz->share_code . '/verify', ['student_id' => $this->anak->id, 'nisn' => '111'])
            ->assertOk();
    }

    public function test_skor_dihitung_di_server(): void
    {
        $quiz = $this->makeQuiz($this->guru);
        [$q1, $q2] = $quiz->questions;

        $payload = [
            'student_id' => $this->anak->id,
            'nisn' => '111',
            'time_spent_seconds' => 120,
            'score' => 100,
            'answers' => [
                ['question_id' => $q1->id, 'option_id' => $q1->options->firstWhere('is_correct', true)->id],
                ['question_id' => $q2->id, 'option_id' => $q2->options->firstWhere('is_correct', false)->id],
            ],
        ];

        $this->postJson('/api/student/quiz/' . $quiz->share_code . '/submit', array_merge($payload, ['nisn' => '000']))
            ->assertUnprocessable();

        $this->postJson('/api/student/quiz/' . $quiz->share_code . '/submit', $payload)
            ->assertCreated()
            ->assertJsonPath('result.score', 50)
            ->assertJsonPath('result.correct_answers', 1)
            ->assertJsonPath('review.questions.0.explanation', 'Rahasia');

        $quiz->update(['status' => 'finished']);
        $this->postJson('/api/student/quiz/' . $quiz->share_code . '/submit', $payload)->assertUnprocessable();

        $this->assertSame(1, StudentResult::count());
    }

    private function submitPayload(Quiz $quiz, bool $correct = true): array
    {
        // options[0] adalah kunci di makeQuiz(); options[1] jawaban salah
        return [
            'student_id' => $this->anak->id,
            'nisn' => '111',
            'time_spent_seconds' => 60,
            'answers' => $quiz->questions->map(fn ($q) => ['question_id' => $q->id, 'option_id' => $q->options[$correct ? 0 : 1]->id])->all(),
        ];
    }

    public function test_siswa_tidak_bisa_mengerjakan_melebihi_kesempatan(): void
    {
        $quiz = $this->makeQuiz($this->guru, ['max_attempts' => 1]);
        $url = '/api/student/quiz/' . $quiz->share_code;

        $this->postJson($url . '/verify', ['student_id' => $this->anak->id, 'nisn' => '111'])
            ->assertOk()->assertJsonPath('remaining_attempts', 1);

        $this->postJson($url . '/submit', $this->submitPayload($quiz, false))
            ->assertCreated()->assertJsonPath('remaining_attempts', 0);

        $this->postJson($url . '/verify', ['student_id' => $this->anak->id, 'nisn' => '111'])
            ->assertUnprocessable()->assertJsonValidationErrors('attempts');
        $this->postJson($url . '/submit', $this->submitPayload($quiz, false))
            ->assertUnprocessable()->assertJsonValidationErrors('attempts');

        // Kesempatan dihitung per siswa, teman sekelas tetap bisa mengerjakan
        $this->postJson($url . '/verify', ['student_id' => $this->temanSekelas->id, 'nisn' => '222'])->assertOk();

        $this->assertSame(1, StudentResult::where('student_id', $this->anak->id)->count());
    }

    public function test_kuis_tanpa_batas_bisa_dikerjakan_berulang(): void
    {
        $quiz = $this->makeQuiz($this->guru);

        foreach (range(1, 3) as $i) {
            $this->postJson('/api/student/quiz/' . $quiz->share_code . '/submit', $this->submitPayload($quiz, false))
                ->assertCreated()->assertJsonPath('remaining_attempts', null);
        }
    }

    public function test_pembuat_kuis_mengatur_kesempatan(): void
    {
        Sanctum::actingAs($this->ortu);
        $response = $this->postJson('/api/quizzes', $this->quizPayload(['target_student_id' => $this->anak->id, 'max_attempts' => 2]))
            ->assertCreated()->assertJsonPath('quiz.max_attempts', 2);
        $quizId = $response->json('quiz.id');

        $this->putJson('/api/quizzes/' . $quizId . '/settings', ['max_attempts' => null])->assertOk();
        $this->assertNull(Quiz::find($quizId)->max_attempts);

        Sanctum::actingAs($this->guru);
        $this->putJson('/api/quizzes/' . $quizId . '/settings', ['max_attempts' => 5])->assertForbidden();
    }
}
