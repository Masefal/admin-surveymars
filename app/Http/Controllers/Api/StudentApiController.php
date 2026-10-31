<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentApiController extends Controller
{
    public function getQuizByCode($share_code)
    {
        $quiz = $this->findActiveQuiz($share_code);

        if (!$quiz) {
            return response()->json(['error' => 'Kuis tidak ditemukan atau sudah ditutup.'], 404);
        }

        // Kunci jawaban dan pembahasan baru dikirim setelah siswa mengumpulkan jawaban
        $quiz->load([
            'subject',
            'studentClass',
            'questions' => fn ($q) => $q->select('id', 'quiz_id', 'question_text', 'type'),
            'questions.options' => fn ($q) => $q->select('id', 'question_id', 'option_text'),
        ]);

        $students = $quiz->eligibleStudents()->orderBy('name', 'asc')->get(['id', 'name']);

        return response()->json([
            'quiz' => $quiz,
            'students' => $students,
            'is_personal' => (bool) $quiz->target_student_id,
        ]);
    }

    public function verifyStudent(Request $request, $share_code)
    {
        $quiz = $this->findActiveQuiz($share_code);

        if (!$quiz) {
            return response()->json(['error' => 'Kuis tidak ditemukan atau sudah ditutup.'], 404);
        }

        $student = $this->resolveStudent($request, $quiz);
        $remaining = $this->ensureHasAttempt($quiz, $student);

        return response()->json([
            'student' => $student->only(['id', 'name']),
            'remaining_attempts' => $remaining,
        ]);
    }

    public function submitResult(Request $request, $share_code)
    {
        $request->validate([
            'answers' => 'present|array',
            'answers.*.question_id' => 'required|integer',
            'answers.*.option_id' => 'nullable|integer',
            'time_spent_seconds' => 'required|integer|min:0',
        ]);

        $quiz = $this->findActiveQuiz($share_code);

        if (!$quiz) {
            return response()->json(['error' => 'Kuis sudah ditutup. Jawaban tidak dapat dikirim.'], 422);
        }

        $student = $this->resolveStudent($request, $quiz);
        $quiz->load('questions.options');

        $selected = collect($request->input('answers'))
            ->pluck('option_id', 'question_id');

        $answersData = [];
        $correctCount = 0;

        foreach ($quiz->questions as $question) {
            $optionId = $selected->get($question->id);
            $option = $optionId ? $question->options->firstWhere('id', (int) $optionId) : null;
            $isCorrect = (bool) $option?->is_correct;

            if ($isCorrect) {
                $correctCount++;
            }

            $answersData[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'selected_option_id' => $option?->id,
                'is_correct' => $isCorrect,
            ];
        }

        $total = $quiz->questions->count();
        $maxSeconds = $quiz->time_limit_minutes * 60;

        // Dikunci per siswa supaya dua kiriman bersamaan tidak sama-sama lolos cek kesempatan
        $result = DB::transaction(function () use ($quiz, $student, $request, $total, $correctCount, $maxSeconds, $answersData) {
            Student::whereKey($student->id)->lockForUpdate()->first();
            $this->ensureHasAttempt($quiz, $student);

            return StudentResult::create([
                'quiz_id' => $quiz->id,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'score' => $total > 0 ? (int) round($correctCount / $total * 100) : 0,
                'correct_answers' => $correctCount,
                'wrong_answers' => $total - $correctCount,
                'time_spent_seconds' => $maxSeconds > 0 ? min($request->time_spent_seconds, $maxSeconds) : $request->time_spent_seconds,
                'answers_data' => $answersData,
            ]);
        });

        return response()->json([
            'message' => 'Berhasil disimpan',
            'result' => $result,
            'remaining_attempts' => $quiz->remainingAttemptsFor($student),
            // Kuis lengkap dengan kunci jawaban dan pembahasan untuk halaman hasil
            'review' => $quiz,
        ], 201);
    }

    private function findActiveQuiz(string $shareCode): ?Quiz
    {
        return Quiz::where('share_code', $shareCode)->where('status', 'active')->first();
    }

    /**
     * Tolak kalau kesempatan mengerjakan dari pembuat kuis sudah habis.
     */
    private function ensureHasAttempt(Quiz $quiz, Student $student): ?int
    {
        $remaining = $quiz->remainingAttemptsFor($student);

        if ($remaining === 0) {
            throw ValidationException::withMessages([
                'attempts' => ["Kesempatan mengerjakan kuis ini sudah habis ({$quiz->max_attempts}x). Hubungi guru atau orang tuamu."],
            ]);
        }

        return $remaining;
    }

    /**
     * Pastikan siswa terdaftar untuk kuis ini dan NISN-nya cocok.
     */
    private function resolveStudent(Request $request, Quiz $quiz): Student
    {
        $request->validate([
            'student_id' => 'required|integer',
            'nisn' => 'required|string',
        ]);

        $student = $quiz->eligibleStudents()->whereKey($request->student_id)->first();

        if (! $student || $student->nisn !== trim($request->nisn)) {
            throw ValidationException::withMessages([
                'nisn' => ['Nama dan NISN tidak cocok, atau kamu tidak terdaftar untuk kuis ini.'],
            ]);
        }

        return $student;
    }
}
