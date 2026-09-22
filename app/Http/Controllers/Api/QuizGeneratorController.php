<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
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
            'jumlah_soal' => 'required|integer|min:1|max:20',
        ]);

        $deskripsi = $request->deskripsi ?? 'Tidak ada konteks tambahan.';

        $prompt = "Anda adalah pembuat soal kuis pendidikan SD yang ahli.
        Tugas: Buat {$request->jumlah_soal} soal pilihan ganda (A, B, C, D) untuk siswa {$request->kelas}.
        Mata Pelajaran: {$request->mapel}.
        Topik/Materi: {$request->topik}.
        Konteks Tambahan: {$deskripsi}.
        
        ATURAN TINGKAT KESULITAN & VARIASI (PENTING!):
        1. Sesuaikan nalar dengan {$request->kelas}. Jika kelas 1-3, gunakan bahasa sangat sederhana. Jika kelas 4-6, gunakan soal nalar/cerita (HOTS) yang menantang.
        2. DILARANG menggunakan soal yang itu-itu saja. Buat skenario, nama tokoh, atau variasi angka yang kreatif dan acak.
        
        KEMBALIKAN HANYA DALAM FORMAT ARRAY JSON seperti struktur berikut:
        [
            {
                \"question_text\": \"Teks pertanyaan di sini?\",
                \"explanation\": \"Penjelasan singkat dan mudah dipahami mengapa jawaban tersebut benar.\",
                \"options\": [
                    {\"option_text\": \"Pilihan A\", \"is_correct\": true},
                    {\"option_text\": \"Pilihan B\", \"is_correct\": false},
                    {\"option_text\": \"Pilihan C\", \"is_correct\": false},
                    {\"option_text\": \"Pilihan D\", \"is_correct\": false}
                ]
            }
        ]";

        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');

        if (! $apiKey) {
            return response()->json([
                'error' => 'API Key Gemini belum disetting. Silakan tambahkan GEMINI_API_KEY di file .env Anda.',
            ], 500);
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        try {
            $response = Http::withoutVerifying()
                ->timeout(120)
                ->post($url, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                    ],
                ]);

            if ($response->successful()) {
                $finishReason = $response->json('candidates.0.finishReason');

                if ($finishReason === 'SAFETY') {
                    Log::warning('Gemini request diblokir oleh Safety filter', [
                        'response' => $response->json(),
                    ]);

                    return response()->json([
                        'error' => 'Materi atau topik kuis terdeteksi sensitif dan diblokir oleh sistem keamanan AI. Coba ubah topik atau deskripsi.',
                    ], 422);
                }

                $aiText = $response->json('candidates.0.content.parts.0.text');

                if (! $aiText) {
                    Log::error('Gemini response tidak memiliki text', [
                        'response' => $response->json(),
                    ]);

                    return response()->json([
                        'error' => 'AI tidak mengembalikan hasil teks soal. Silakan klik tombol "Generate" sekali lagi.',
                    ], 500);
                }

                $data = json_decode($aiText, true);

                if (json_last_error() !== JSON_ERROR_NONE || ! is_array($data) || empty($data)) {
                    Log::error('Gemini menghasilkan format tidak valid', [
                        'raw_response' => $aiText,
                        'json_error' => json_last_error_msg(),
                    ]);

                    return response()->json([
                        'error' => 'AI menghasilkan format kuis yang tidak sesuai standar. Silakan coba generate ulang.',
                    ], 500);
                }

                // Validasi integritas butir soal
                foreach ($data as $index => $item) {
                    if (! isset($item['question_text']) || ! isset($item['options']) || ! is_array($item['options']) || count($item['options']) < 2) {
                        Log::error('Format butir soal tidak lengkap', [
                            'index' => $index,
                            'item' => $item,
                        ]);

                        return response()->json([
                            'error' => 'Format soal nomor '.($index + 1).' tidak lengkap dari AI. Silakan coba generate ulang.',
                        ], 500);
                    }
                }

                return response()->json($data);
            }

            Log::error('Gemini API Error Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'error' => $this->parseGeminiError($response),
            ], $response->status());

        } catch (ConnectionException $e) {
            Log::error('Gemini Connection / Timeout Error: '.$e->getMessage());

            return response()->json([
                'error' => 'Waktu tunggu habis (timeout) atau koneksi ke server AI terputus. Silakan periksa jaringan dan coba lagi.',
            ], 504);

        } catch (\Throwable $e) {
            Log::error('Quiz Generator System Error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan sistem saat memproses soal: '.$e->getMessage(),
            ], 500);
        }
    }

    private function parseGeminiError($response): string
    {
        $status = $response->status();
        $errorMessage = $response->json('error.message', '');
        $errorStatus = $response->json('error.status', '');

        if ($status === 429 || $errorStatus === 'RESOURCE_EXHAUSTED' || str_contains($errorMessage, 'Quota exceeded')) {
            return 'Batas kuota Gemini AI telah tercapai atau server sedang padat (Rate Limit). Harap tunggu 1-2 menit sebelum mencoba lagi.';
        }

        if ($status === 400 && str_contains(strtolower($errorMessage), 'api key')) {
            return 'Kunci API Gemini tidak valid. Harap periksa kembali GEMINI_API_KEY di file .env.';
        }

        if ($status === 403) {
            return 'Akses ke Gemini API ditolak. Pastikan API Key aktif dan memiliki izin yang sesuai di Google AI Studio.';
        }

        if ($status === 404) {
            return 'Model AI yang dikonfigurasi tidak ditemukan atau sudah tidak didukung. Periksa pengaturan GEMINI_MODEL Anda.';
        }

        if ($status >= 500) {
            return 'Server Google AI sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.';
        }

        if (! empty($errorMessage)) {
            return 'Gemini API menolak permintaan: '.$errorMessage;
        }

        return 'Gagal memproses soal dengan AI (Kode Status: '.$status.'). Silakan coba lagi.';
    }
}
