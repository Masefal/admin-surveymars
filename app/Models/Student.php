<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'nisn',
        'name',
        'student_class_id',
        'parent_id'
    ];

    /**
     * Kolom tetap bernama `nisn`, tetapi isinya NIS sekolah (mis. 2324.01.003).
     * Format yang diterima: angka, boleh dipisah titik.
     */
    public const NIS_RULE = ['required', 'string', 'max:20', 'regex:/^[0-9]+(\.[0-9]+)*$/'];

    public const NIS_MESSAGES = [
        'nisn.required' => 'NIS wajib diisi.',
        'nisn.max' => 'NIS terlalu panjang.',
        'nisn.regex' => 'NIS hanya berisi angka dan titik, contoh 2324.01.003.',
    ];

    /** NIS tanpa titik/spasi, supaya "2324.01.003" dan "232401003" dianggap sama. */
    public static function normalizeNis(?string $nis): string
    {
        return preg_replace('/\D/', '', (string) $nis);
    }

    public function scopeWhereNis($query, ?string $nis)
    {
        return $query->whereRaw("REPLACE(nisn, '.', '') = ?", [self::normalizeNis($nis)]);
    }

    public function matchesNis(?string $nis): bool
    {
        $given = self::normalizeNis($nis);

        return $given !== '' && $given === self::normalizeNis($this->nisn);
    }

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class, 'student_class_id');
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function results()
    {
        return $this->hasMany(StudentResult::class);
    }
}