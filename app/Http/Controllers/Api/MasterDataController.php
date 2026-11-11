<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\Student;
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
            'classes' => StudentClass::orderBy('level')->orderBy('name')->get(),
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
        // Kelas = level (1-6) + rombel (A, B, C, ...), contoh "4C"
        $data = $request->validate([
            'level' => 'required|integer|between:1,6',
            'rombel' => ['required', 'string', 'regex:/^[A-Za-z]$/'],
        ], [
            'rombel.regex' => 'Rombel berupa satu huruf, contoh A atau C.',
        ]);

        $name = $data['level'].strtoupper($data['rombel']);

        if (StudentClass::where('name', $name)->exists()) {
            return response()->json(['message' => "Kelas {$name} sudah ada."], 422);
        }

        $studentClass = StudentClass::create(['name' => $name, 'level' => (string) $data['level']]);

        return response()->json($studentClass, 201);
    }

    public function destroyClass($id)
    {
        $studentClass = StudentClass::findOrFail($id);

        // Menghapus kelas ikut menghapus siswa & kuisnya (cascade), jadi hanya kelas kosong yang boleh dihapus
        if (Student::where('student_class_id', $id)->exists() || Quiz::where('student_class_id', $id)->exists()) {
            return response()->json(['message' => "Kelas {$studentClass->name} masih punya siswa atau kuis, jadi tidak bisa dihapus."], 422);
        }

        $studentClass->delete();
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

    public function updateMaterial(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('materials')->where('subject_id', $material->subject_id)->ignore($material->id),
            ],
            'description' => 'nullable|string|max:10000',
        ], [
            'name.unique' => 'Materi dengan nama ini sudah ada di mata pelajaran tersebut.',
        ]);

        $material->update($data);

        return response()->json($material);
    }
}
