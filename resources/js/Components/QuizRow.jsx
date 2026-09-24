import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';

export default function QuizRow({ id, title, kelas, status, statusBg, statusColor, peserta }) {
    return (
        <Link to={`/quiz/${id}`} className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group">
            <div className="min-w-0 pr-3">
                <h4 className="font-bold text-gray-900 group-hover:text-[#1b6d39] transition-colors truncate text-sm sm:text-base">{title}</h4>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mt-1">
                    <span className="text-gray-500 font-medium truncate">{kelas}</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-gray-500 font-medium shrink-0">
                        <Users size={14} /> {peserta}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${statusBg} ${statusColor}`}>
                    {status}
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1b6d39] transition-colors" />
            </div>
        </Link>
    );
}