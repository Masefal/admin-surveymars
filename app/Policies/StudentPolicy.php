<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    /**
     * Guru boleh melihat semua siswa, orang tua hanya anaknya sendiri.
     */
    public function view(User $user, Student $student): bool
    {
        return $user->isGuru() || (int) $student->parent_id === (int) $user->id;
    }
}
