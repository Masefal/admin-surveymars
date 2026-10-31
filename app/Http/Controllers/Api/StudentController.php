<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Student::with(['studentClass', 'parent:id,name']);

        if (! $user->isGuru()) {
            $query->where('parent_id', $user->id);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nisn' => 'required|string|unique:students,nisn',
            'student_class_id' => 'required|exists:student_classes,id'
        ]);

        $student = Student::create([
            'name' => $request->name,
            'nisn' => $request->nisn,
            'student_class_id' => $request->student_class_id
        ]);

        return response()->json(['message' => 'Siswa berhasil ditambahkan', 'student' => $student], 201);
    }

    public function report($id)
    {
        $student = Student::with('studentClass')->findOrFail($id);
        Gate::authorize('view', $student);

        $history = StudentResult::with(['quiz', 'quiz.subject'])
                    ->where('student_id', $id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'student' => $student,
            'history' => $history
        ]);
    }

    public function linkChild(Request $request)
    {
        $request->validate([
            'nisn' => 'required|string',
            'name' => 'required|string',
        ]);

        $student = Student::where('nisn', trim($request->nisn))->first();

        // Pesan yang sama untuk NISN salah maupun nama tidak cocok, supaya NISN tidak bisa ditebak
        if (! $student || ! $this->sameName($student->name, $request->name)) {
            return response()->json(['message' => 'NISN dan nama lengkap anak tidak cocok dengan data sekolah.'], 404);
        }

        if ($student->parent_id && (int) $student->parent_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'NISN ini sudah terhubung dengan akun orang tua lain. Silakan hubungi wali kelas.'], 400);
        }

        $student->parent_id = $request->user()->id;
        $student->save();

        return response()->json(['message' => 'Data anak berhasil dihubungkan!', 'student' => $student]);
    }

    public function getLinkedStudent(Request $request)
    {
        $children = $request->user()->children()->with('studentClass')->orderBy('name')->get();

        if ($children->isEmpty()) {
            return response()->json(['students' => [], 'student' => null, 'results' => []]);
        }

        $student = $children->firstWhere('id', (int) $request->query('student_id')) ?? $children->first();

        $results = StudentResult::with('quiz.subject')
                                ->where('student_id', $student->id)
                                ->orderBy('created_at', 'desc')
                                ->get();

        return response()->json([
            'students' => $children,
            'student' => $student,
            'results' => $results
        ]);
    }

    private function sameName(string $a, string $b): bool
    {
        $normalize = fn (string $s) => mb_strtolower(preg_replace('/\s+/', ' ', trim($s)));

        return $normalize($a) === $normalize($b);
    }
}
