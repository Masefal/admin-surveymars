<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kuis buatan orang tua wajib ditinjau guru sebelum bisa dikerjakan siswa.
     * approved_at kosong = menunggu persetujuan guru.
     */
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('max_attempts');
            $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
        });

        // Kuis yang sudah ada dianggap sudah disetujui supaya tidak tiba-tiba tertutup
        DB::table('quizzes')->whereNull('approved_at')->update(['approved_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn('approved_at');
        });
    }
};
