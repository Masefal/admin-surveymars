<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('student_results', function (Blueprint $table) {
            $table->json('answers_data')->nullable()->after('time_spent_seconds');
        });
    }

    public function down()
    {
        Schema::table('student_results', function (Blueprint $table) {
            $table->dropColumn('answers_data');
        });
    }
};