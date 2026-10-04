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
        if ($user && $user->role === 'orang_tua') {
            $students = Student::with(['studentClass', 'parent'])
                ->where('parent_id', $user->id)
                ->get();
        } else {
            $students = Student::with(['studentClass', 'parent'])->get();
        }
        
        return response()->json($students);
    }
}