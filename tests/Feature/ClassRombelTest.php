<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\StudentClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClassRombelTest extends TestCase
{
    use RefreshDatabase;

    private User $guru;

    protected function setUp(): void
    {
        parent::setUp();
        $this->guru = User::create(['name' => 'Guru', 'email' => 'guru@test.id', 'password' => Hash::make('x'), 'role' => 'guru']);
        Sanctum::actingAs($this->guru);
    }

    public function test_migrasi_membuat_kelas_1a_sampai_6i(): void
    {
        $this->assertSame(54, StudentClass::count());
        $this->assertDatabaseHas('student_classes', ['name' => '4C', 'level' => '4']);
        $this->assertDatabaseHas('student_classes', ['name' => '6I', 'level' => '6']);
    }

    public function test_tambah_kelas_dari_level_dan_rombel(): void
    {
        StudentClass::where('name', '4J')->delete();

        $this->postJson('/api/master-data/classes', ['level' => 4, 'rombel' => 'j'])
            ->assertCreated()->assertJson(['name' => '4J', 'level' => '4']);
        $this->postJson('/api/master-data/classes', ['level' => 4, 'rombel' => 'C'])->assertUnprocessable();
        $this->postJson('/api/master-data/classes', ['level' => 7, 'rombel' => 'A'])->assertJsonValidationErrors('level');
    }

    public function test_kelas_yang_masih_punya_siswa_tidak_bisa_dihapus(): void
    {
        $kelas = StudentClass::where('name', '4C')->first();
        Student::create(['nisn' => '1', 'name' => 'Budi', 'student_class_id' => $kelas->id]);

        $this->deleteJson('/api/master-data/classes/'.$kelas->id)->assertUnprocessable();
        $this->assertDatabaseHas('students', ['name' => 'Budi']);

        $kosong = StudentClass::where('name', '4D')->first();
        $this->deleteJson('/api/master-data/classes/'.$kosong->id)->assertOk();
    }

}
