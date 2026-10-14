<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentResult;
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

    public function report($id)
    {
        try {
            $student = Student::with('studentClass')->findOrFail($id);
            
            $history = StudentResult::with(['quiz', 'quiz.subject'])
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
            'student_id' => 'required'
        ]);
        
        $student = Student::find($request->student_id);
        
        if (!$student) {
            return response()->json(['error' => 'Siswa tidak ditemukan.'], 404);
        }

        $student->parent_id = $request->user()->id;
        $student->save();

        return response()->json(['message' => 'Data anak berhasil dihubungkan!']);
    }
}