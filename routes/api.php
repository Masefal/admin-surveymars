<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuizGeneratorController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\Api\MasterDataController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/student/quiz/{share_code}', [StudentApiController::class, 'getQuizByCode']);
Route::post('/student/quiz/{share_code}/submit', [StudentApiController::class, 'submitResult']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    Route::get('/dashboard-stats', [DashboardController::class, 'index']);
    Route::post('/generate-quiz', [QuizGeneratorController::class, 'generate']);
    
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);

    Route::get('/master-data', [MasterDataController::class, 'index']);
    Route::post('/master-data/subjects', [MasterDataController::class, 'storeSubject']);
    Route::delete('/master-data/subjects/{id}', [MasterDataController::class, 'destroySubject']);
    Route::post('/master-data/classes', [MasterDataController::class, 'storeClass']);
    Route::delete('/master-data/classes/{id}', [MasterDataController::class, 'destroyClass']);
});