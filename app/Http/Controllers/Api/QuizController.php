<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\StudentClass;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with(['subject', 'studentClass'])->withCount('studentResults');

        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $quizzes = $query->orderBy('created_at', 'desc')->get();

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'quizInfo.mapel' => 'required|string',
            'quizInfo.kelas' => 'required|string',
            'quizInfo.topik' => 'required|string',
            'questions' => 'required|array'
        ]);

        $subject = Subject::firstOrCreate(['name' => $request->quizInfo['mapel']]);
        $studentClass = StudentClass::firstOrCreate(['name' => $request->quizInfo['kelas']]);
        $shareCode = strtoupper(Str::random(5));

        $quiz = Quiz::create([
            'subject_id' => $subject->id,
            'student_class_id' => $studentClass->id,
            'title' => $request->quizInfo['topik'],
            'description' => $request->quizInfo['deskripsi'] ?? null,
            'share_code' => $shareCode,
            'status' => 'active',
            'time_limit_minutes' => 30
        ]);

        foreach ($request->questions as $q) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'question_text' => $q['question_text'],
                'explanation' => $q['explanation'] ?? null,
                'type' => 'multiple_choice',
                'points' => 10
            ]);

            foreach ($q['options'] as $opt) {
                Option::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct']
                ]);
            }
        }

        return response()->json([
            'quiz' => $quiz->load('subject', 'studentClass')
        ], 201);
    }

    public function show($id)
    {
        $quiz = Quiz::with(['subject', 'studentClass', 'studentResults' => function($query) {
            $query->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($quiz);
    }
}