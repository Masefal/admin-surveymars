<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // Jumlah kesempatan mengerjakan per siswa; null = tidak dibatasi (perilaku kuis lama)
            $table->unsignedSmallInteger('max_attempts')->nullable()->after('time_limit_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('max_attempts');
        });
    }
};
