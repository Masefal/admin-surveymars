<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $guarded = [];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function studentResults()
    {
        return $this->hasMany(StudentResult::class);
    }
}