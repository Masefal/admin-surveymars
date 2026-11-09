<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Subject;
use App\Models\StudentClass;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MasterDataController extends Controller
{
    public function index()
    {
        return response()->json([
            'subjects' => Subject::orderBy('name')->get(),
            'classes' => StudentClass::orderBy('name')->get(),
            'materials' => Material::orderBy('subject_id')->orderBy('id')->get(['id', 'subject_id', 'name', 'description']),
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

    public function storeMaterial(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('materials')->where('subject_id', $request->subject_id),
            ],
            'description' => 'nullable|string|max:10000',
        ], [
            'name.unique' => 'Materi dengan nama ini sudah ada di mata pelajaran tersebut.',
        ]);

        return response()->json(Material::create($data), 201);
    }

    public function destroyMaterial($id)
    {
        // Soal yang memakai materi ini tetap ada; material_id-nya menjadi kosong (nullOnDelete)
        Material::destroy($id);

        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}
