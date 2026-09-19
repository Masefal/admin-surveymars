<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalQuiz = Quiz::count();$activeQuiz = Quiz::where('status', 'active')->count();
        
        $recentQuizzes = Quiz::with(['subject', 'studentClass'])
                            ->withCount('studentResults')
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