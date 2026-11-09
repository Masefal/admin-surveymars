<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalQuiz = Quiz::count();$activeQuiz = Quiz::where('status', 'active')->count();
        
        $recentQuizzes = Quiz::with(['subject', 'studentClass'])
                            // Peserta = siswa unik; ronde ulang siswa yang sama tidak dihitung dua kali
                            ->withCount(['studentResults' => fn ($q) => $q->select(DB::raw('count(distinct student_id)'))])
                            ->orderBy('created_at', 'desc')
                            ->take(5)
                            ->get();

        return response()->json([
            'total_quiz' => $totalQuiz,
            'active_quiz' => $activeQuiz,
            'recent_quizzes' => $recentQuizzes
        ]);
    }
}