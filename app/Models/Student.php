<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'nisn', 
        'student_class_id', 
        'parent_id'
    ];

    public function studentClass()
    {
        return $this->belongsTo(StudentClass::class);
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}