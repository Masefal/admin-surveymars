<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user && $user->role === 'orang_tua' && $request->query('all') !== 'true') {
            $students = Student::with(['studentClass', 'parent'])
                ->where('parent_id', $user->id)
                ->get();
        } else {
            $students = Student::with(['studentClass', 'parent'])->get();
        }
        
        return response()->json($students);
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
        try {
            $student = Student::with('studentClass')->findOrFail($id);
            
            $history = \App\Models\StudentResult::with(['quiz', 'quiz.subject'])
                        ->where('student_id', $id)
                        ->orderBy('created_at', 'desc')
                        ->get();

            return response()->json([
                'student' => $student,
                'history' => $history
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan pada server',
                'detail_error' => $e->getMessage()
            ], 500);
        }
    }

    public function linkChild(Request $request)
    {
        $request->validate([
            'nisn' => 'required'
        ]);
        
        $student = Student::where('nisn', $request->nisn)->first();
        
        if (!$student) {
            return response()->json(['message' => 'Siswa dengan NISN tersebut tidak ditemukan.'], 404);
        }

        if ($student->parent_id && $student->parent_id !== $request->user()->id) {
            return response()->json(['message' => 'NISN ini sudah terhubung dengan akun orang tua lain.'], 400);
        }

        $student->parent_id = $request->user()->id;
        $student->save();

        return response()->json(['message' => 'Data anak berhasil dihubungkan!']);
    }

    public function getLinkedStudent(Request $request)
    {
        $student = Student::with('studentClass')
                          ->where('parent_id', $request->user()->id)
                          ->first();

        if (!$student) {
            return response()->json(['student' => null]);
        }

        $results = \App\Models\StudentResult::with('quiz')
                                ->where('student_id', $student->id)
                                ->orderBy('created_at', 'desc')
                                ->get();

        return response()->json([
            'student' => $student,
            'results' => $results
        ]);
    }
}