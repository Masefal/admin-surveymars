<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuizGeneratorController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'mapel' => 'required|string',
            'kelas' => 'required|string',
            'topik' => 'required|string',
            'deskripsi' => 'nullable|string',
            'jumlah_soal' => 'required|integer|min:1|max:20'
        ]);

        $prompt = "Anda adalah pembuat soal kuis pendidikan SD yang ahli.
        Tugas: Buat {$request->jumlah_soal} soal pilihan ganda (A, B, C, D) untuk siswa {$request->kelas}.
        Mata Pelajaran: {$request->mapel}.
        Topik/Materi: {$request->topik}.
        Konteks Tambahan: {$request->deskripsi}.
        
        WAJIB buat soal yang mudah dipahami anak-anak.
        
        KEMBALIKAN HANYA DALAM FORMAT ARRAY JSON seperti struktur berikut:
        [
            {
                \"question_text\": \"Teks pertanyaan?\",
                \"options\": [
                    {\"option_text\": \"Pilihan A\", \"is_correct\": true},
                    {\"option_text\": \"Pilihan B\", \"is_correct\": false},
                    {\"option_text\": \"Pilihan C\", \"is_correct\": false},
                    {\"option_text\": \"Pilihan D\", \"is_correct\": false}
                ]
            }
        ]";

        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            return response()->json(['error' => 'API Key Gemini belum disetting di file .env'], 500);
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={$apiKey}";

        try {
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->post($url, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                $aiText = $response->json('candidates.0.content.parts.0.text');
                return response($aiText)->header('Content-Type', 'application/json');
            }

            Log::error('Gemini Error: ' . $response->body());
            
            return response()->json([
                'error' => 'Gemini API menolak request: ' . $response->json('error.message', 'Unknown error')
            ], $response->status());

        } catch (\Exception $e) {
            Log::error('System Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal menghubungi server Gemini: ' . $e->getMessage()
            ], 500);
        }
    }
}