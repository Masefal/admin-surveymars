<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentResult;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    public function getQuizByCode($share_code)
    {
        $quiz = Quiz::with(['subject', 'studentClass', 'questions.options'])
                    ->where('share_code', $share_code)
                    ->where('status', 'active')
                    ->first();

        if (!$quiz) {
            return response()->json(['error' => 'Kuis tidak ditemukan atau sudah ditutup.'], 404);
        }

        $students = Student::where('student_class_id', $quiz->student_class_id)
                           ->orderBy('name', 'asc')
                           ->get(['id', 'name']);

        return response()->json([
            'quiz' => $quiz,
            'students' => $students
        ]);
    }

    public function submitResult(Request $request, $share_code)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'student_name' => 'required|string',
            'score' => 'required|integer',
            'correct_answers' => 'required|integer',
            'wrong_answers' => 'required|integer',
            'time_spent_seconds' => 'required|integer',
            'answers_data' => 'nullable|array'
        ]);

        $quiz = Quiz::where('share_code', $share_code)->firstOrFail();

        $result = StudentResult::create([
            'quiz_id' => $quiz->id,
            'student_id' => $request->student_id,
            'student_name' => $request->student_name,
            'score' => $request->score,
            'correct_answers' => $request->correct_answers,
            'wrong_answers' => $request->wrong_answers,
            'time_spent_seconds' => $request->time_spent_seconds,
            'answers_data' => json_encode($request->answers_data),
        ]);

        return response()->json(['message' => 'Berhasil disimpan', 'result' => $result], 201);
    }
}