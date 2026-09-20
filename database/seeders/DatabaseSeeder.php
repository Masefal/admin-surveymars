<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\StudentClass;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;
use App\Models\StudentResult;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $mtk = Subject::firstOrCreate(['name' => 'Matematika']);
        $pkn = Subject::firstOrCreate(['name' => 'Pendidikan Pancasila']);
        $ipa = Subject::firstOrCreate(['name' => 'Ilmu Pengetahuan Alam']);
        
        $kls4 = StudentClass::firstOrCreate(['name' => 'Kelas 4']);
        $kls5 = StudentClass::firstOrCreate(['name' => 'Kelas 5']);

        $quiz1 = Quiz::create([
            'subject_id' => $mtk->id,
            'student_class_id' => $kls5->id,
            'title' => 'Latihan Bangun Datar',
            'description' => 'Soal evaluasi pemahaman bangun datar sederhana.',
            'share_code' => 'DEMO1',
            'status' => 'active',
            'time_limit_minutes' => 30
        ]);

        $q1 = Question::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'Berapakah jumlah sisi pada bangun persegi panjang?',
            'explanation' => 'Persegi panjang memiliki 4 sisi, yaitu 2 sisi panjang dan 2 sisi lebar.',
            'type' => 'multiple_choice',
            'points' => 100
        ]);

        $options = [
            ['text' => '2', 'is_correct' => false],
            ['text' => '3', 'is_correct' => false],
            ['text' => '4', 'is_correct' => true],
            ['text' => '5', 'is_correct' => false],
        ];

        foreach ($options as $opt) {
            Option::create([
                'question_id' => $q1->id,
                'option_text' => $opt['text'],
                'is_correct' => $opt['is_correct']
            ]);
        }

        $students = ['Nabil', 'Rafi', 'Ahmad'];
        foreach ($students as $student) {
            StudentResult::create([
                'quiz_id' => $quiz1->id,
                'student_name' => $student,
                'score' => 100,
                'correct_answers' => 1,
                'wrong_answers' => 0,
                'time_spent_seconds' => rand(120, 300),
                'answers_data' => json_encode([
                    [
                        'question_text' => 'Berapakah jumlah sisi pada bangun persegi panjang?',
                        'is_correct' => true,
                        'student_answer' => '4',
                        'correct_answer' => '4'
                    ]
                ])
            ]);
        }

        Quiz::create([
            'subject_id' => $pkn->id,
            'student_class_id' => $kls4->id,
            'title' => 'Nilai-nilai Pancasila',
            'description' => 'Evaluasi penerapan Pancasila di sekolah.',
            'share_code' => 'DEMO2',
            'status' => 'finished',
            'time_limit_minutes' => 45
        ]);
    }
}