<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuizGeneratorController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\StudentController;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Portal siswa (tanpa login)
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/student/quiz/{share_code}', [StudentApiController::class, 'getQuizByCode']);
    Route::post('/student/quiz/{share_code}/verify', [StudentApiController::class, 'verifyStudent']);
    Route::post('/student/quiz/{share_code}/submit', [StudentApiController::class, 'submitResult']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    // Dipakai guru dan orang tua; isi datanya difilter per peran di controller/policy
    Route::post('/generate-quiz', [QuizGeneratorController::class, 'generate'])->middleware('throttle:10,1');

    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/quizzes/{id}/status', [QuizController::class, 'updateStatus']);
    Route::put('/quizzes/{id}/settings', [QuizController::class, 'updateSettings']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{id}/questions', [QuizController::class, 'addQuestion']);
    Route::put('/questions/{id}', [QuizController::class, 'updateQuestion']);
    Route::delete('/questions/{id}', [QuizController::class, 'deleteQuestion']);

    Route::get('/master-data', [MasterDataController::class, 'index']);
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{id}/report', [StudentController::class, 'report']);

    Route::middleware('role:guru')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'index']);

        Route::post('/master-data/subjects', [MasterDataController::class, 'storeSubject']);
        Route::delete('/master-data/subjects/{id}', [MasterDataController::class, 'destroySubject']);
        Route::post('/master-data/classes', [MasterDataController::class, 'storeClass']);
        Route::delete('/master-data/classes/{id}', [MasterDataController::class, 'destroyClass']);
        Route::post('/master-data/materials', [MasterDataController::class, 'storeMaterial']);
        Route::delete('/master-data/materials/{id}', [MasterDataController::class, 'destroyMaterial']);

        Route::post('/students', [StudentController::class, 'store']);
    });

    Route::middleware('role:orang_tua')->group(function () {
        Route::post('/parent/link', [StudentController::class, 'linkChild']);
        Route::get('/parent/linked-student', [StudentController::class, 'getLinkedStudent']);
    });
});
