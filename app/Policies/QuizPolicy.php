<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function view(User $user, Quiz $quiz): bool
    {
        return Quiz::visibleTo($user)->whereKey($quiz->id)->exists();
    }

    /**
     * Ubah status, hapus kuis, dan kelola soal hanya oleh pembuatnya.
     */
    public function update(User $user, Quiz $quiz): bool
    {
        return (int) $quiz->user_id === (int) $user->id;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        return $this->update($user, $quiz);
    }
}
