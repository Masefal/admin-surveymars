<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::visibleTo($request->user())
            ->with(['subject', 'studentClass', 'targetStudent:id,name'])
            ->withCount('studentResults');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $quizzes = $query->orderBy('created_at', 'desc')->get()
            ->each(fn (Quiz $quiz) => $quiz->setAttribute('can_manage', $request->user()->can('update', $quiz)));

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'quizInfo' => 'required|array',
            'quizInfo.subject_id' => 'required|exists:subjects,id',
            'quizInfo.student_class_id' => 'nullable|exists:student_classes,id',
            'quizInfo.target_student_id' => 'nullable|exists:students,id',
            'quizInfo.topik' => 'required|string|max:255',
            'quizInfo.deskripsi' => 'nullable|string',
            'quizInfo.waktu' => 'nullable|integer|min:1|max:180',
            'quizInfo.max_attempts' => 'nullable|integer|min:1|max:20',
            'questions' => 'required|array|min:1',
            ...$this->questionRules('questions.*.'),
        ]);

        $quizInfo = $request->input('quizInfo');
        $targetId = $quizInfo['target_student_id'] ?? null;
        $target = $targetId ? Student::find($targetId) : null;

        if ($user->isOrangTua() && (! $target || $target->parent_id !== $user->id)) {
            throw ValidationException::withMessages([
                'quizInfo.target_student_id' => ['Orang tua hanya dapat membuat kuis personal untuk anaknya sendiri.'],
            ]);
        }

        // Kuis personal selalu mengikuti kelas siswa targetnya
        $classId = $target ? $target->student_class_id : ($quizInfo['student_class_id'] ?? null);

        if (! $classId) {
            throw ValidationException::withMessages([
                'quizInfo.student_class_id' => ['Kelas wajib dipilih.'],
            ]);
        }

        foreach ($request->input('questions') as $index => $q) {
            $this->ensureOneCorrectOption($q['options'], 'questions.' . $index . '.options');
        }

        $quiz = DB::transaction(function () use ($request, $user, $quizInfo, $classId, $target) {
            $quiz = Quiz::create([
                'user_id' => $user->id,
                'subject_id' => $quizInfo['subject_id'],
                'student_class_id' => $classId,
                'target_student_id' => $target?->id,
                'title' => $quizInfo['topik'],
                'description' => $quizInfo['deskripsi'] ?? null,
                'share_code' => $this->generateShareCode(),
                'status' => 'active',
                'time_limit_minutes' => $quizInfo['waktu'] ?? 30,
                'max_attempts' => $quizInfo['max_attempts'] ?? null,
            ]);

            foreach ($request->input('questions') as $q) {
                $this->createQuestion($quiz, $q);
            }

            return $quiz;
        });

        return response()->json([
            'quiz' => $quiz->load('subject', 'studentClass', 'targetStudent:id,name'),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $quiz = Quiz::with(['subject', 'studentClass', 'targetStudent:id,name', 'questions.options'])->findOrFail($id);

        Gate::authorize('view', $quiz);

        // Orang tua hanya melihat nilai anaknya sendiri
        $quiz->load(['studentResults' => function ($query) use ($user) {
            if (! $user->isGuru()) {
                $query->whereIn('student_id', $user->children()->pluck('id'));
            }
            $query->orderBy('created_at', 'desc');
        }]);

        $quiz->setAttribute('can_manage', $user->can('update', $quiz));

        return response()->json($quiz);
    }

    public function updateStatus($id)
    {
        $quiz = Quiz::findOrFail($id);
        Gate::authorize('update', $quiz);

        $quiz->status = $quiz->status === 'active' ? 'finished' : 'active';
        $quiz->save();

        return response()->json(['message' => 'Status berhasil diubah', 'quiz' => $quiz]);
    }

    public function updateSettings(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        Gate::authorize('update', $quiz);

        $data = $request->validate([
            'max_attempts' => 'present|nullable|integer|min:1|max:20',
        ]);

        $quiz->update($data);

        return response()->json(['message' => 'Pengaturan kuis disimpan', 'quiz' => $quiz]);
    }

    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        Gate::authorize('delete', $quiz);

        $quiz->delete();

        return response()->json(['message' => 'Kuis berhasil dihapus']);
    }

    public function addQuestion(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);
        Gate::authorize('update', $quiz);

        $data = $request->validate($this->questionRules());
        $this->ensureOneCorrectOption($data['options'], 'options');

        DB::transaction(fn () => $this->createQuestion($quiz, $data));

        return response()->json(['message' => 'Soal ditambahkan']);
    }

    public function updateQuestion(Request $request, $questionId)
    {
        $question = Question::with('quiz')->findOrFail($questionId);
        Gate::authorize('update', $question->quiz);

        $data = $request->validate($this->questionRules());
        $this->ensureOneCorrectOption($data['options'], 'options');

        DB::transaction(function () use ($question, $data) {
            $question->update([
                'question_text' => $data['question_text'],
                // Pembahasan lama dipertahankan kalau tidak ikut dikirim
                'explanation' => array_key_exists('explanation', $data) ? $data['explanation'] : $question->explanation,
                'material_id' => array_key_exists('material_id', $data) ? $data['material_id'] : $question->material_id,
            ]);

            $question->options()->delete();
            $this->createOptions($question, $data['options']);
        });

        return response()->json(['message' => 'Soal diperbarui']);
    }

    public function deleteQuestion($questionId)
    {
        $question = Question::with('quiz')->findOrFail($questionId);
        Gate::authorize('update', $question->quiz);

        $question->delete();

        return response()->json(['message' => 'Soal dihapus']);
    }

    private function questionRules(string $prefix = ''): array
    {
        return [
            $prefix . 'question_text' => 'required|string',
            $prefix . 'explanation' => 'nullable|string',
            $prefix . 'material_id' => 'nullable|integer|exists:materials,id',
            $prefix . 'options' => 'required|array|min:2|max:6',
            $prefix . 'options.*.option_text' => 'required|string|max:255',
            $prefix . 'options.*.is_correct' => 'required|boolean',
        ];
    }

    private function ensureOneCorrectOption(array $options, string $field): void
    {
        $correct = collect($options)->filter(fn ($opt) => filter_var($opt['is_correct'], FILTER_VALIDATE_BOOLEAN))->count();

        if ($correct !== 1) {
            throw ValidationException::withMessages([
                $field => ['Setiap soal harus memiliki tepat satu kunci jawaban.'],
            ]);
        }
    }

    private function createQuestion(Quiz $quiz, array $data): Question
    {
        $question = $quiz->questions()->create([
            'material_id' => $data['material_id'] ?? null,
            'question_text' => $data['question_text'],
            'explanation' => $data['explanation'] ?? null,
            'type' => 'multiple_choice',
            'points' => 10,
        ]);

        $this->createOptions($question, $data['options']);

        return $question;
    }

    private function createOptions(Question $question, array $options): void
    {
        foreach ($options as $opt) {
            $question->options()->create([
                'option_text' => $opt['option_text'],
                'is_correct' => filter_var($opt['is_correct'], FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    private function generateShareCode(): string
    {
        do {
            $code = strtoupper(Str::random(5));
        } while (Quiz::where('share_code', $code)->exists());

        return $code;
    }
}
