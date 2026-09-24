import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function StudentResult() {
    const location = useLocation();
    const { quizId } = useParams();
    
    const savedData = !location.state && quizId ? JSON.parse(sessionStorage.getItem(`quiz_result_${quizId}`) || 'null') : null;
    const { result, quiz, studentAnswers } = location.state || savedData || {};

    if (!result || !quiz) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans p-4 sm:p-6 text-center">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm max-w-sm w-full">
                    <div className="text-4xl mb-4">📋</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Hasil Kuis</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        Tidak ada data hasil kuis yang tersedia.
                    </p>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">
                <header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <h1 className="font-bold text-gray-900 tracking-tight text-xs sm:text-sm uppercase">
                        Hasil Kuis
                    </h1>
                </header>

                <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto items-center">
                    <div className="bg-green-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border-4 border-green-100 shrink-0">
                        <Trophy size={40} className="text-[#1b6d39]" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1.5">Nilai: {result.score}</h2>
                    <p className="text-gray-500 font-medium mb-6 sm:mb-8 text-center text-xs sm:text-sm px-2">
                        Kerja bagus, {result.student_name}!<br/>Kamu telah menyelesaikan kuis ini.
                    </p>

                    <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
                        <h3 className="font-bold text-gray-900 mb-4 sm:mb-5 text-center border-b border-gray-100 pb-3 sm:pb-4 text-xs sm:text-sm truncate">
                            {quiz.subject?.name} — {quiz.title}
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 text-green-600 mb-1">
                                    <CheckCircle2 size={15} strokeWidth={2.5} />
                                    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider">Benar</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-gray-900">{result.correct_answers}</span>
                            </div>
                            
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center gap-1 text-red-500 mb-1">
                                    <XCircle size={15} strokeWidth={2.5} />
                                    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider">Salah</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-gray-900">{result.wrong_answers}</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 text-orange-500 mb-1">
                                    <Clock size={15} strokeWidth={2.5} />
                                    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider">Waktu</span>
                                </div>
                                <span className="text-lg sm:text-2xl font-black text-gray-900">{formatTime(result.time_spent_seconds)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full mb-6 sm:mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 px-1 text-sm sm:text-base">Pembahasan Soal</h3>
                        <div className="space-y-3 sm:space-y-4">
                            {quiz.questions?.map((q) => {
                                const isCorrect = q.options?.find(o => o.id === studentAnswers?.[q.id])?.is_correct;
                                return (
                                    <div key={q.id} className={`p-4 sm:p-5 rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 mb-2">
                                            <span className={`font-bold text-xs sm:text-sm shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                {isCorrect ? '✓ BENAR' : '✗ SALAH'}
                                            </span>
                                            <span className="text-gray-900 font-semibold text-xs sm:text-sm">{q.question_text}</span>
                                        </div>
                                        <div className="text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-100 mt-2.5 text-gray-600 leading-relaxed">
                                            <strong className="text-gray-800">Pembahasan:</strong> {q.explanation || 'Tidak ada pembahasan khusus.'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto w-full pt-4 sm:pt-6 pb-2 border-t border-gray-100 text-center">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <CheckCircle2 size={14} className="text-[#1b6d39]" />
                            Kuis telah selesai dikerjakan & dinilai
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}