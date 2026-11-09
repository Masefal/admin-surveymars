<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentResult;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $pendingIds = $this->pendingQuestionIds($quiz, $student);
        $total = $quiz->questions()->count();

        // Semua soal sudah benar di ronde sebelumnya: tidak perlu mengulang lagi
        if ($pendingIds->isEmpty()) {
            return response()->json([
                'student' => $student->only(['id', 'name']),
                'completed' => true,
                'total_questions' => $total,
            ]);
        }

        $remaining = $this->ensureHasAttempt($quiz, $student);

        // Ronde ulang hanya berisi soal yang masih salah; kunci jawaban tetap disembunyikan
        $questions = $quiz->questions()
            ->whereIn('id', $pendingIds)
            ->select('id', 'quiz_id', 'question_text', 'type')
            ->with(['options' => fn ($q) => $q->select('id', 'question_id', 'option_text')])
            ->get();

        return response()->json([
            'student' => $student->only(['id', 'name']),
            'remaining_attempts' => $remaining,
            'completed' => false,
            'round' => $this->roundFor($quiz, $student),
            'total_questions' => $total,
            'questions' => $questions,
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

        $maxSeconds = $quiz->time_limit_minutes * 60;

        // Dikunci per siswa supaya dua kiriman bersamaan tidak sama-sama lolos cek kesempatan
        [$result, $round, $roundQuestions, $stillWrongIds] = DB::transaction(function () use ($quiz, $student, $request, $selected, $maxSeconds) {
            Student::whereKey($student->id)->lockForUpdate()->first();

            // Soal ronde ini ditentukan server, bukan dari kiriman browser
            $pendingIds = $this->pendingQuestionIds($quiz, $student);
            if ($pendingIds->isEmpty()) {
                throw ValidationException::withMessages([
                    'attempts' => ['Semua soal kuis ini sudah kamu jawab benar.'],
                ]);
            }
            $this->ensureHasAttempt($quiz, $student);

            $round = $this->roundFor($quiz, $student);
            $roundQuestions = $quiz->questions->whereIn('id', $pendingIds)->values();

            $answersData = [];
            $stillWrongIds = [];

            foreach ($roundQuestions as $question) {
                $optionId = $selected->get($question->id);
                $option = $optionId ? $question->options->firstWhere('id', (int) $optionId) : null;
                $isCorrect = (bool) $option?->is_correct;

                if (! $isCorrect) {
                    $stillWrongIds[] = $question->id;
                }

                $answersData[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'selected_option_id' => $option?->id,
                    'is_correct' => $isCorrect,
                ];
            }

            // Nilai = penguasaan seluruh kuis: soal yang sudah benar di ronde mana pun dibanding total soal
            $total = $quiz->questions->count();
            $mastered = $total - count($stillWrongIds);

            $result = StudentResult::create([
                'quiz_id' => $quiz->id,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'score' => $total > 0 ? (int) round($mastered / $total * 100) : 0,
                'correct_answers' => $mastered,
                'wrong_answers' => count($stillWrongIds),
                'time_spent_seconds' => $maxSeconds > 0 ? min($request->time_spent_seconds, $maxSeconds) : $request->time_spent_seconds,
                'answers_data' => $answersData,
            ]);

            return [$result, $round, $roundQuestions, $stillWrongIds];
        });

        $remaining = $quiz->remainingAttemptsFor($student);
        $canRetry = count($stillWrongIds) > 0 && $remaining !== 0;

        // Selama masih ada ronde berikutnya, kunci & pembahasan soal yang salah disembunyikan
        // supaya ronde ulang tidak sekadar menyalin kunci jawaban.
        $review = $roundQuestions->map(function ($question) use ($canRetry, $stillWrongIds) {
            $hidden = $canRetry && in_array($question->id, $stillWrongIds, true);

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'explanation' => $hidden ? null : $question->explanation,
                'key_hidden' => $hidden,
                'options' => $question->options->map(fn ($o) => [
                    'id' => $o->id,
                    'option_text' => $o->option_text,
                    'is_correct' => $hidden ? null : (bool) $o->is_correct,
                ])->values(),
            ];
        })->values();

        return response()->json([
            'message' => 'Berhasil disimpan',
            'result' => $result,
            'remaining_attempts' => $remaining,
            'round' => $round,
            'round_question_count' => $roundQuestions->count(),
            'round_correct' => $roundQuestions->count() - count($stillWrongIds),
            'total_questions' => $quiz->questions->count(),
            'remaining_wrong' => count($stillWrongIds),
            'can_retry' => $canRetry,
            // Kuis dengan soal ronde ini saja untuk halaman hasil
            'review' => array_merge($quiz->only(['id', 'title', 'share_code']), ['questions' => $review]),
        ], 201);
    }

    private function findActiveQuiz(string $shareCode): ?Quiz
    {
        return Quiz::where('share_code', $shareCode)->where('status', 'active')->first();
    }

    /**
     * Soal yang harus dikerjakan di ronde berikutnya: semua soal pada ronde pertama,
     * lalu hanya soal yang masih salah (atau belum pernah dikerjakan) di ronde terakhir.
     */
    private function pendingQuestionIds(Quiz $quiz, Student $student): Collection
    {
        $allIds = $quiz->questions()->pluck('id');

        $last = StudentResult::where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->latest('id')
            ->first();

        if (! $last || ! is_array($last->answers_data)) {
            return $allIds;
        }

        $answered = collect($last->answers_data)->filter(fn ($a) => isset($a['question_id']));
        if ($answered->isEmpty()) {
            return $allIds;
        }

        // Soal yang benar di ronde mana pun dianggap sudah dikuasai
        $mastered = StudentResult::where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->get(['answers_data'])
            ->flatMap(fn ($r) => collect(is_array($r->answers_data) ? $r->answers_data : [])
                ->where('is_correct', true)->pluck('question_id'))
            ->unique();

        return $allIds->diff($mastered)->values();
    }

    private function roundFor(Quiz $quiz, Student $student): int
    {
        return StudentResult::where('quiz_id', $quiz->id)->where('student_id', $student->id)->count() + 1;
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
