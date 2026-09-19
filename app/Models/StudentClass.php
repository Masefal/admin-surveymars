<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentClass extends Model
{
    protected $guarded = [];

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}