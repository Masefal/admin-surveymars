<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Kuis buatan orang tua wajib ditinjau dan disetujui guru sebelum bisa dikerjakan anak.
 */
class ParentQuizApprovalTest extends TestCase
{
    use RefreshDatabase;

    private User $guru;
    private User $ortu;
    private Student $anak;
    private Subject $mapel;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->ortu = User::factory()->create(['role' => 'orang_tua']);
        $kelas = StudentClass::create(['name' => 'Kelas 4']);
        $this->mapel = Subject::create(['name' => 'Matematika']);
        $this->anak = Student::create(['nisn' => '1111111111', 'name' => 'Budi', 'student_class_id' => $kelas->id, 'parent_id' => $this->ortu->id]);
    }

    private function payload(): array
    {
        return [
            'quizInfo' => ['subject_id' => $this->mapel->id, 'target_student_id' => $this->anak->id, 'topik' => 'Pecahan'],
            'questions' => [[
                'question_text' => '1/2 + 1/2 = ?',
                'options' => [['option_text' => '1', 'is_correct' => true], ['option_text' => '2', 'is_correct' => false]],
            ]],
        ];
    }

    private function createAsParent(): Quiz
    {
        Sanctum::actingAs($this->ortu);
        $id = $this->postJson('/api/quizzes', $this->payload())->assertCreated()->json('quiz.id');

        return Quiz::findOrFail($id);
    }

    public function test_kuis_ortu_masuk_draf_dan_belum_bisa_dikerjakan(): void
    {
        $quiz = $this->createAsParent();

        $this->assertSame('draft', $quiz->status);
        $this->assertNull($quiz->approved_at);
        $this->getJson('/api/student/quiz/'.$quiz->share_code)->assertNotFound();
    }

    public function test_ortu_tidak_bisa_membuka_sendiri_atau_menyetujui(): void
    {
        $quiz = $this->createAsParent();

        $this->putJson('/api/quizzes/'.$quiz->id.'/status')->assertForbidden();
        $this->postJson('/api/quizzes/'.$quiz->id.'/approve')->assertForbidden();
        $this->assertSame('draft', $quiz->fresh()->status);
    }

    public function test_guru_menyetujui_lalu_kuis_bisa_dikerjakan(): void
    {
        $quiz = $this->createAsParent();

        Sanctum::actingAs($this->guru);
        $this->getJson('/api/quizzes/'.$quiz->id)->assertOk();
        $this->postJson('/api/quizzes/'.$quiz->id.'/approve')->assertOk();

        $quiz->refresh();
        $this->assertSame('active', $quiz->status);
        $this->assertSame($this->guru->id, $quiz->approved_by);
        $this->getJson('/api/student/quiz/'.$quiz->share_code)->assertOk();

        // Sudah disetujui tidak perlu disetujui ulang
        $this->postJson('/api/quizzes/'.$quiz->id.'/approve')->assertForbidden();
    }

    public function test_ortu_mengubah_soal_setelah_disetujui_kembali_menunggu_persetujuan(): void
    {
        $quiz = $this->createAsParent();
        Sanctum::actingAs($this->guru);
        $this->postJson('/api/quizzes/'.$quiz->id.'/approve')->assertOk();

        Sanctum::actingAs($this->ortu);
        $question = $quiz->questions()->first();
        $this->putJson('/api/questions/'.$question->id, [
            'question_text' => 'Soal diubah ortu',
            'options' => [['option_text' => 'A', 'is_correct' => true], ['option_text' => 'B', 'is_correct' => false]],
        ])->assertOk();

        $quiz->refresh();
        $this->assertNull($quiz->approved_at);
        $this->assertSame('draft', $quiz->status);
        $this->getJson('/api/student/quiz/'.$quiz->share_code)->assertNotFound();
    }

    public function test_kuis_guru_langsung_aktif(): void
    {
        Sanctum::actingAs($this->guru);
        $payload = $this->payload();
        $payload['quizInfo']['target_student_id'] = null;
        $payload['quizInfo']['student_class_id'] = $this->anak->student_class_id;

        $id = $this->postJson('/api/quizzes', $payload)->assertCreated()->json('quiz.id');
        $quiz = Quiz::find($id);

        $this->assertSame('active', $quiz->status);
        $this->assertNotNull($quiz->approved_at);
    }
}
