<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Kelas dipecah menjadi level (1-6) + rombel (A-I), contoh "4C".
 * - "Kelas 4" lama (berisi kuis latihan SBdP Miss Elvi) menjadi "4C".
 * - "Kelas N" lain yang masih kosong dihapus; yang sudah dipakai diberi level N.
 * - Semua kelas 1A-6I dibuat bila belum ada.
 * Hanya mengubah data, tidak mengubah struktur tabel.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $old4 = DB::table('student_classes')->where('name', 'Kelas 4')->first();
        if ($old4 && ! DB::table('student_classes')->where('name', '4C')->exists()) {
            DB::table('student_classes')->where('id', $old4->id)->update(['name' => '4C', 'level' => '4', 'updated_at' => $now]);
        }

        foreach (DB::table('student_classes')->where('name', 'like', 'Kelas %')->get() as $cls) {
            if (! preg_match('/^Kelas ([1-6])$/', $cls->name, $m)) {
                continue;
            }
            $used = DB::table('students')->where('student_class_id', $cls->id)->exists()
                || DB::table('quizzes')->where('student_class_id', $cls->id)->exists();

            $used
                ? DB::table('student_classes')->where('id', $cls->id)->update(['level' => $m[1], 'updated_at' => $now])
                : DB::table('student_classes')->where('id', $cls->id)->delete();
        }

        foreach (range(1, 6) as $level) {
            foreach (range('A', 'I') as $rombel) {
                $name = $level.$rombel;
                if (! DB::table('student_classes')->where('name', $name)->exists()) {
                    DB::table('student_classes')->insert([
                        'name' => $name, 'level' => (string) $level, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Data kelas tidak dikembalikan otomatis
    }
};
