import React from 'react';
import { Users, UserRound } from 'lucide-react';

// Penanda jenis kuis: Umum (satu kelas) atau Personal (satu siswa)
export default function QuizTypeBadge({ quiz, className = '' }) {
    const isPersonal = !!quiz.target_student_id;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${isPersonal ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'} ${className}`}>
            {isPersonal ? <UserRound size={12} /> : <Users size={12} />}
            {isPersonal ? 'Personal' : 'Umum'}
        </span>
    );
}
