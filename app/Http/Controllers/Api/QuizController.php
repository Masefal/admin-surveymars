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

        if ($request->user() && $request->user()->role === 'orang_tua') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $quizzes = $query->orderBy('created_at', 'desc')->get();

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'quizInfo' => 'required|array',
            'questions' => 'required|array'
        ]);

        $quizInfo = $request->input('quizInfo');
        $shareCode = strtoupper(Str::random(5));

        $subjectId = $quizInfo['subject_id'] ?? null;
        if (!$subjectId) {
            $subjectName = $quizInfo['mata_pelajaran'] ?? $quizInfo['subject'] ?? $quizInfo['mapel'] ?? 'Umum';
            $subject = Subject::firstOrCreate(['name' => $subjectName]);
            $subjectId = $subject->id;
        }

        $classId = $quizInfo['student_class_id'] ?? null;
        if (!$classId) {
            $className = $quizInfo['kelas'] ?? $quizInfo['class'] ?? 'Kelas Umum';
            $studentClass = StudentClass::firstOrCreate(['name' => $className]);
            $classId = $studentClass->id;
        }

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'subject_id' => $subjectId,
            'student_class_id' => $classId,
            'title' => $quizInfo['topik'] ?? ($quizInfo['title'] ?? 'Kuis Baru'),
            'description' => $quizInfo['deskripsi'] ?? ($quizInfo['description'] ?? null),
            'share_code' => $shareCode,
            'status' => 'active',
            'time_limit_minutes' => $quizInfo['waktu'] ?? 30
        ]);

        $questions = $request->input('questions', []);

        foreach ($questions as $q) {
            if (!is_array($q)) continue;

            $question = Question::create([
                'quiz_id' => $quiz->id,
                'question_text' => $q['question_text'] ?? '',
                'explanation' => $q['explanation'] ?? null,
                'type' => 'multiple_choice',
                'points' => 10
            ]);

            $options = $q['options'] ?? [];
            
            if (is_array($options)) {
                foreach ($options as $opt) {
                    if (is_array($opt)) {
                        Option::create([
                            'question_id' => $question->id,
                            'option_text' => $opt['option_text'] ?? '',
                            'is_correct' => $opt['is_correct'] ?? false
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'quiz' => $quiz->load('subject', 'studentClass')
        ], 201);
    }

    public function show($id)
    {
        $quiz = Quiz::with(['subject', 'studentClass', 'questions.options', 'studentResults' => function($query) {
            $query->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($quiz);
    }

    public function updateStatus($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->status = $quiz->status === 'active' ? 'finished' : 'active';
        $quiz->save();

        return response()->json(['message' => 'Status berhasil diubah', 'quiz' => $quiz]);
    }

    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json(['message' => 'Kuis berhasil dihapus']);
    }

    public function addQuestion(Request $request, $quizId)
    {
        $request->validate(['question_text' => 'required', 'options' => 'required|array']);
        
        $question = Question::create([
            'quiz_id' => $quizId,
            'question_text' => $request->question_text,
            'type' => 'multiple_choice',
            'points' => 10
        ]);

        foreach ($request->options as $opt) {
            Option::create([
                'question_id' => $question->id,
                'option_text' => $opt['option_text'],
                'is_correct' => $opt['is_correct']
            ]);
        }

        return response()->json(['message' => 'Soal ditambahkan']);
    }

    public function updateQuestion(Request $request, $questionId)
    {
        $request->validate(['question_text' => 'required', 'options' => 'required|array']);
        
        $question = Question::findOrFail($questionId);
        $question->update(['question_text' => $request->question_text]);

        Option::where('question_id', $questionId)->delete();

        foreach ($request->options as $opt) {
            Option::create([
                'question_id' => $question->id,
                'option_text' => $opt['option_text'],
                'is_correct' => $opt['is_correct']
            ]);
        }

        return response()->json(['message' => 'Soal diperbarui']);
    }

    public function deleteQuestion($questionId)
    {
        Question::findOrFail($questionId)->delete();
        return response()->json(['message' => 'Soal dihapus']);
    }
}