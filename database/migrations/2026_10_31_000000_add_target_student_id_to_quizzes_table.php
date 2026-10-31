<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // Diisi untuk kuis personal (remedial) yang hanya boleh dikerjakan satu siswa
            $table->foreignId('target_student_id')->nullable()->constrained('students')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('target_student_id');
        });
    }
};
