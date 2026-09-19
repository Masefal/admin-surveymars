<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\StudentClass;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    public function index()
    {
        return response()->json([
            'subjects' => Subject::orderBy('name')->get(),
            'classes' => StudentClass::orderBy('name')->get()
        ]);
    }

    public function storeSubject(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:subjects,name|max:255'
        ]);

        $subject = Subject::create([
            'name' => $request->name
        ]);

        return response()->json($subject, 201);
    }

    public function destroySubject($id)
    {
        Subject::destroy($id);
        return response()->json(['message' => 'Mata pelajaran berhasil dihapus']);
    }

    public function storeClass(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:student_classes,name|max:255'
        ]);

        $studentClass = StudentClass::create([
            'name' => $request->name
        ]);

        return response()->json($studentClass, 201);
    }

    public function destroyClass($id)
    {
        StudentClass::destroy($id);
        return response()->json(['message' => 'Kelas berhasil dihapus']);
    }
}