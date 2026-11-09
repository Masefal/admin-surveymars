<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'max_attempts' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class);
    }

    public function studentResults()
    {
        return $this->hasMany(StudentResult::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function targetStudent()
    {
        return $this->belongsTo(Student::class, 'target_student_id');
    }

    /**
     * Guru melihat semua kuis. Orang tua melihat kuis buatannya sendiri,
     * kuis kelas anaknya, dan kuis personal untuk anaknya.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isGuru()) {
            return $query;
        }

        $children = $user->children()->get(['id', 'student_class_id']);

        return $query->where(function (Builder $q) use ($user, $children) {
            $q->where('user_id', $user->id)
                ->orWhereIn('target_student_id', $children->pluck('id'))
                ->orWhere(function (Builder $q) use ($children) {
                    $q->whereNull('target_student_id')
                        ->whereIn('student_class_id', $children->pluck('student_class_id')->unique());
                });
        });
    }

    /**
     * Sisa kesempatan siswa; null berarti tidak dibatasi.
     */
    public function remainingAttemptsFor(Student $student): ?int
    {
        if ($this->max_attempts === null) {
            return null;
        }

        $used = $this->studentResults()->where('student_id', $student->id)->count();

        return max(0, $this->max_attempts - $used);
    }

    /**
     * Siswa yang boleh mengerjakan kuis ini.
     */
    public function eligibleStudents(): Builder
    {
        if ($this->target_student_id) {
            return Student::whereKey($this->target_student_id);
        }

        return Student::where('student_class_id', $this->student_class_id);
    }
}
