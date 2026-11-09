import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Sama dengan MaterialPerformance::PASSING_PERCENT di backend
export const PASSING_PERCENT = 70;

const barColor = (p) => (p >= PASSING_PERCENT ? 'bg-green-500' : 'bg-red-500');

/** Chip ringkas materi yang perlu perhatian khusus (dipakai di tabel Kelola Siswa). */
export function NeedsAttentionNote({ items = [], hasData = true }) {
    if (!hasData) {
        return <span className="text-xs text-gray-400">Belum ada nilai</span>;
    }
    if (items.length === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
                <CheckCircle2 size={12} /> Semua materi tuntas
            </span>
        );
    }
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 uppercase tracking-wide">
                <AlertTriangle size={12} /> Perlu perhatian khusus
            </div>
            <div className="flex flex-wrap gap-1">
                {items.map((m, i) => (
                    <span key={i} title={`${m.subject || '-'} · ${m.correct}/${m.total} soal benar`}
                        className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {m.material} <span className="font-black">{m.percent}%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

/** Daftar lengkap performa per materi (persentase soal benar). */
export function MaterialPerformanceList({ items = [] }) {
    if (items.length === 0) {
        return <p className="p-6 text-center text-gray-400 text-sm">Belum ada jawaban yang bisa dianalisis per materi.</p>;
    }
    return (
        <ul className="divide-y divide-gray-50">
            {items.map((m, i) => (
                <li key={i} className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-1/2 min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">{m.material}</div>
                        <div className="text-xs text-gray-400">{m.subject || '-'} · {m.correct}/{m.total} soal benar</div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor(m.percent)}`} style={{ width: `${m.percent}%` }} />
                        </div>
                        <span className={`w-12 text-right font-black text-sm ${m.percent >= PASSING_PERCENT ? 'text-green-700' : 'text-red-600'}`}>{m.percent}%</span>
                    </div>
                    {m.needs_attention && (
                        <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-md">
                            <AlertTriangle size={12} /> Perlu remedial
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}
