<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuizGeneratorController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StudentApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/dashboard-stats', [DashboardController::class, 'index']);
Route::post('/generate-quiz', [QuizGeneratorController::class, 'generate']);
Route::post('/quizzes', [QuizController::class, 'store']);

Route::get('/student/quiz/{share_code}', [StudentApiController::class, 'getQuizByCode']);
Route::post('/student/quiz/{share_code}/submit', [StudentApiController::class, 'submitResult']);