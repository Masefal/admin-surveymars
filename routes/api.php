<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuizGeneratorController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StudentApiController;
use App\Http\Controllers\Api\MasterDataController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/dashboard-stats', [DashboardController::class, 'index']);
Route::post('/generate-quiz', [QuizGeneratorController::class, 'generate']);

Route::get('/quizzes', [QuizController::class, 'index']);
Route::post('/quizzes', [QuizController::class, 'store']);
Route::get('/quizzes/{id}', [QuizController::class, 'show']);

Route::get('/student/quiz/{share_code}', [StudentApiController::class, 'getQuizByCode']);
Route::post('/student/quiz/{share_code}/submit', [StudentApiController::class, 'submitResult']);

Route::get('/master-data', [MasterDataController::class, 'index']);
Route::post('/master-data/subjects', [MasterDataController::class, 'storeSubject']);
Route::delete('/master-data/subjects/{id}', [MasterDataController::class, 'destroySubject']);
Route::post('/master-data/classes', [MasterDataController::class, 'storeClass']);
Route::delete('/master-data/classes/{id}', [MasterDataController::class, 'destroyClass']);