<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\StudentResult;
use App\Services\MaterialPerformance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class StudentController extends Controller
{
    public function index(Request $request, MaterialPerformance $performance)
    {
        $user = $request->user();

        $query = Student::with(['studentClass', 'parent:id,name']);

        if (! $user->isGuru()) {
            $query->where('parent_id', $user->id);
        }

        $students = $query->orderBy('name')->get();
        $byStudent = $performance->forStudents($students->pluck('id'));

        // Performa per materi + catatan materi yang perlu remedial/personalisasi
        $students->each(function (Student $student) use ($byStudent) {
            $materials = $byStudent[$student->id] ?? [];
            $student->setAttribute('material_performance', $materials);
            $student->setAttribute('needs_attention', MaterialPerformance::weak($materials));
        });

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->merge(['nisn' => trim((string) $request->nisn)]);
        $request->validate([
            'name' => 'required|string|max:255',
            'nisn' => [...Student::NIS_RULE, $this->uniqueNis()],
            'student_class_id' => 'required|exists:student_classes,id'
        ], Student::NIS_MESSAGES);

        $student = Student::create([
            'name' => $request->name,
            'nisn' => $request->nisn,
            'student_class_id' => $request->student_class_id
        ]);

        return response()->json(['message' => 'Siswa berhasil ditambahkan', 'student' => $student], 201);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->merge(['nisn' => trim((string) $request->nisn)]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'nisn' => [...Student::NIS_RULE, $this->uniqueNis($student->id)],
            'student_class_id' => 'required|exists:student_classes,id',
        ], Student::NIS_MESSAGES);

        DB::transaction(function () use ($student, $data) {
            // Kuis personal selalu mengikuti kelas siswanya
            if ((int) $data['student_class_id'] !== (int) $student->student_class_id) {
                Quiz::where('target_student_id', $student->id)->update(['student_class_id' => $data['student_class_id']]);
            }
            $student->update($data);
        });

        return response()->json(['message' => 'Data siswa diperbarui', 'student' => $student->load('studentClass')]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        DB::transaction(function () use ($student) {
            // Kuis personal untuk siswa ini ikut dihapus; kalau tidak, target_student_id menjadi null
            // dan kuis itu berubah menjadi kuis untuk seluruh kelas.
            Quiz::where('target_student_id', $student->id)->delete();
            // Riwayat nilai ikut terhapus lewat foreign key cascade
            $student->delete();
        });

        return response()->json(['message' => 'Siswa berhasil dihapus']);
    }

    public function report($id, MaterialPerformance $performance)
    {
        $student = Student::with('studentClass')->findOrFail($id);
        Gate::authorize('view', $student);

        $history = StudentResult::with(['quiz', 'quiz.subject'])
                    ->where('student_id', $id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        $materials = $performance->forStudents([$student->id])[$student->id] ?? [];

        return response()->json([
            'student' => $student,
            'history' => $history,
            'material_performance' => $materials,
            'needs_attention' => MaterialPerformance::weak($materials),
        ]);
    }

    public function linkChild(Request $request)
    {
        $request->merge(['nisn' => trim((string) $request->nisn)]);
        $request->validate([
            'nisn' => Student::NIS_RULE,
            'name' => 'required|string',
        ], Student::NIS_MESSAGES);

        $student = Student::whereNis($request->nisn)->first();

        // Pesan yang sama untuk NIS salah maupun nama tidak cocok, supaya NIS tidak bisa ditebak
        if (! $student || ! $this->sameName($student->name, $request->name)) {
            return response()->json(['message' => 'NIS dan nama lengkap anak tidak cocok dengan data sekolah.'], 404);
        }

        if ($student->parent_id && (int) $student->parent_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'NIS ini sudah terhubung dengan akun orang tua lain. Silakan hubungi wali kelas.'], 400);
        }

        $student->parent_id = $request->user()->id;
        $student->save();

        return response()->json(['message' => 'Data anak berhasil dihubungkan!', 'student' => $student]);
    }

    public function getLinkedStudent(Request $request, MaterialPerformance $performance)
    {
        $children = $request->user()->children()->with('studentClass')->orderBy('name')->get();

        if ($children->isEmpty()) {
            return response()->json(['students' => [], 'student' => null, 'results' => [], 'material_performance' => [], 'needs_attention' => []]);
        }

        $student = $children->firstWhere('id', (int) $request->query('student_id')) ?? $children->first();

        $results = StudentResult::with('quiz.subject')
                                ->where('student_id', $student->id)
                                ->orderBy('created_at', 'desc')
                                ->get();

        $materials = $performance->forStudents([$student->id])[$student->id] ?? [];

        return response()->json([
            'students' => $children,
            'student' => $student,
            'results' => $results,
            'material_performance' => $materials,
            'needs_attention' => MaterialPerformance::weak($materials),
        ]);
    }

    /** NIS unik walau ditulis dengan/tanpa titik. */
    private function uniqueNis(?int $ignoreId = null): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($ignoreId) {
            $exists = Student::whereNis($value)
                ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
                ->exists();

            if ($exists) {
                $fail('NIS ini sudah terdaftar.');
            }
        };
    }

    private function sameName(string $a, string $b): bool
    {
        $normalize = fn (string $s) => mb_strtolower(preg_replace('/\s+/', ' ', trim($s)));

        return $normalize($a) === $normalize($b);
    }
}
