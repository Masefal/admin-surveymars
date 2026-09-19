import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function QuizRow({ title, kelas, status, statusBg, statusColor, peserta }) {
    return (
        <div className="grid grid-cols-12 gap-4 items-center p-3.5 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="col-span-5 font-bold text-gray-900 truncate">{title}</div>
            <div className="col-span-2 text-gray-500 text-sm">{kelas}</div>
            <div className="col-span-2">
                <span className={`px-3 py-1.5 ${statusBg} ${statusColor} text-xs font-bold rounded-full`}>
                    {status}
                </span>
            </div>
            <div className="col-span-2 text-gray-500 text-sm">{peserta}</div>
            <div className="col-span-1 text-right">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </div>
    );
}