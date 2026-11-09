<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentClass;
use App\Models\StudentResult;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $guru;
    private User $ortu;
    private StudentClass $kelas4;
    private StudentClass $kelas5;
    private Student $siswa;
    private Student $lain;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guru = User::factory()->create(['role' => 'guru']);
        $this->ortu = User::factory()->create(['role' => 'orang_tua']);
        $this->kelas4 = StudentClass::create(['name' => 'Kelas 4']);
        $this->kelas5 = StudentClass::create(['name' => 'Kelas 5']);
        $this->siswa = Student::create(['nisn' => '1111111111', 'name' => 'Budi', 'student_class_id' => $this->kelas4->id, 'parent_id' => $this->ortu->id]);
        $this->lain = Student::create(['nisn' => '2222222222', 'name' => 'Siti', 'student_class_id' => $this->kelas4->id]);
    }

    private function quiz(array $attrs = []): Quiz
    {
        $mapel = Subject::firstOrCreate(['name' => 'SBdP']);

        return Quiz::create(array_merge([
            'user_id' => $this->guru->id, 'subject_id' => $mapel->id, 'student_class_id' => $this->kelas4->id,
            'title' => 'Kuis', 'share_code' => strtoupper(substr(md5(uniqid()), 0, 5)), 'status' => 'active', 'time_limit_minutes' => 30,
        ], $attrs));
    }

    public function test_hanya_guru_yang_bisa_mengubah_dan_menghapus_siswa(): void
    {
        Sanctum::actingAs($this->ortu);
        $this->putJson('/api/students/'.$this->siswa->id, ['name' => 'X', 'nisn' => '1111111111', 'student_class_id' => $this->kelas4->id])->assertForbidden();
        $this->deleteJson('/api/students/'.$this->siswa->id)->assertForbidden();
        $this->assertDatabaseHas('students', ['id' => $this->siswa->id, 'name' => 'Budi']);
    }

    public function test_guru_mengubah_data_siswa_dan_kuis_personal_ikut_pindah_kelas(): void
    {
        $personal = $this->quiz(['target_student_id' => $this->siswa->id]);
        Sanctum::actingAs($this->guru);

        $this->putJson('/api/students/'.$this->siswa->id, ['name' => 'Budi Santoso', 'nisn' => '1111111119', 'student_class_id' => $this->kelas5->id])
            ->assertOk()->assertJsonPath('student.name', 'Budi Santoso');

        $this->assertDatabaseHas('students', ['id' => $this->siswa->id, 'nisn' => '1111111119', 'student_class_id' => $this->kelas5->id]);
        $this->assertSame($this->kelas5->id, $personal->fresh()->student_class_id);
        // Orang tua tetap terhubung
        $this->assertSame($this->ortu->id, $this->siswa->fresh()->parent_id);
    }

    public function test_nisn_saat_edit_harus_10_angka_dan_unik(): void
    {
        Sanctum::actingAs($this->guru);
        $url = '/api/students/'.$this->siswa->id;

        $this->putJson($url, ['name' => 'Budi', 'nisn' => '12345abcde', 'student_class_id' => $this->kelas4->id])->assertJsonValidationErrors('nisn');
        $this->putJson($url, ['name' => 'Budi', 'nisn' => '2222222222', 'student_class_id' => $this->kelas4->id])->assertJsonValidationErrors('nisn');
        // NISN miliknya sendiri boleh dipakai lagi
        $this->putJson($url, ['name' => 'Budi', 'nisn' => '1111111111', 'student_class_id' => $this->kelas4->id])->assertOk();
    }

    public function test_hapus_siswa_menghapus_nilai_dan_kuis_personalnya_saja(): void
    {
        $kelas = $this->quiz();
        $personal = $this->quiz(['target_student_id' => $this->siswa->id]);
        $personalLain = $this->quiz(['target_student_id' => $this->lain->id]);
        StudentResult::create(['quiz_id' => $kelas->id, 'student_id' => $this->siswa->id, 'student_name' => 'Budi', 'score' => 50]);
        StudentResult::create(['quiz_id' => $kelas->id, 'student_id' => $this->lain->id, 'student_name' => 'Siti', 'score' => 90]);

        Sanctum::actingAs($this->guru);
        $this->deleteJson('/api/students/'.$this->siswa->id)->assertOk();

        $this->assertDatabaseMissing('students', ['id' => $this->siswa->id]);
        $this->assertDatabaseMissing('quizzes', ['id' => $personal->id]);
        $this->assertDatabaseHas('quizzes', ['id' => $kelas->id]);
        $this->assertDatabaseHas('quizzes', ['id' => $personalLain->id, 'target_student_id' => $this->lain->id]);
        $this->assertSame(1, StudentResult::count());
    }
}
