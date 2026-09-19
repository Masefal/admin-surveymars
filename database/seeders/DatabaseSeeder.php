<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\StudentClass;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $subject = Subject::create([
            'name' => 'Matematika',
            'description' => 'Pelajaran Matematika SD'
        ]);

        $kelas = StudentClass::create([
            'name' => 'Kelas IV A',
            'level' => '4'
        ]);

        $quiz = Quiz::create([
            'subject_id' => $subject->id,
            'student_class_id' => $kelas->id,
            'title' => 'Bangun Datar',
            'description' => 'Latihan mengenal dan memahami bangun datar.',
            'share_code' => '8K2X9',
            'status' => 'active',
            'time_limit_minutes' => 30
        ]);

        $question = Question::create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Perhatikan bangun datar berikut. Bangun yang memiliki empat sisi sama panjang adalah ...',
            'type' => 'multiple_choice',
            'points' => 10
        ]);

        Option::insert([
            ['question_id' => $question->id, 'option_text' => 'Persegi', 'is_correct' => true],
            ['question_id' => $question->id, 'option_text' => 'Persegi panjang', 'is_correct' => false],
            ['question_id' => $question->id, 'option_text' => 'Segitiga', 'is_correct' => false],
            ['question_id' => $question->id, 'option_text' => 'Lingkaran', 'is_correct' => false],
        ]);
    }
}