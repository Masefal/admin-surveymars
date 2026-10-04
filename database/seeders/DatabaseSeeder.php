<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\StudentClass;
use App\Models\Student;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;
use App\Models\StudentResult;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $guru = User::firstOrCreate(
            ['email' => 'guru@fithrahinsani.org'],
            ['name' => 'Pak Nabil (Guru)', 'password' => Hash::make('rahasia123'), 'role' => 'guru']
        );

        $ortu = User::firstOrCreate(
            ['email' => 'ortu@fithrahinsani.org'],
            ['name' => 'Bapak Budi (Ortu Andi)', 'password' => Hash::make('rahasia123'), 'role' => 'orang_tua']
        );

        $mtk = Subject::firstOrCreate(['name' => 'Matematika']);
        $kls5 = StudentClass::firstOrCreate(['name' => 'Kelas 5']);

        $siswaAndi = Student::firstOrCreate(
            ['nisn' => '1234567890'],
            ['name' => 'Andi', 'student_class_id' => $kls5->id, 'parent_id' => $ortu->id] // Andi terhubung ke akun Budi
        );

        $quiz = Quiz::create([
            'subject_id' => $mtk->id,
            'student_class_id' => $kls5->id,
            'title' => 'Latihan Bangun Datar',
            'description' => 'Evaluasi bangun datar.',
            'share_code' => 'DEMO1',
            'status' => 'active',
            'time_limit_minutes' => 30
        ]);

        $q1 = Question::create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Berapa jumlah sisi pada persegi?',
            'type' => 'multiple_choice',
            'points' => 100
        ]);
        Option::create(['question_id' => $q1->id, 'option_text' => '3', 'is_correct' => false]);
        Option::create(['question_id' => $q1->id, 'option_text' => '4', 'is_correct' => true]);

        StudentResult::create([
            'quiz_id' => $quiz->id,
            'student_id' => $siswaAndi->id,
            'score' => 100,
            'correct_answers' => 1,
            'wrong_answers' => 0,
            'time_spent_seconds' => 120,
            'answers_data' => json_encode([
                [
                    'question_text' => 'Berapa jumlah sisi pada persegi?',
                    'is_correct' => true,
                    'student_answer' => '4',
                    'correct_answer' => '4'
                ]
            ])
        ]);
    }
}