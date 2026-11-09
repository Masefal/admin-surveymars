import React, { useState } from 'react';
import { formatDuration } from '../format';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, AlertCircle, RotateCcw, Loader2, Lock } from 'lucide-react';
import { startRound, verifyErrorMessage } from '../studentRound';

export default function StudentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizId } = useParams();
    const {
        result, quiz, studentAnswers, remainingAttempts,
        round = 1, roundQuestionCount, roundCorrect, remainingWrong = 0, canRetry = false,
        student, baseQuiz,
    } = location.state || {};
    const [retrying, setRetrying] = useState(false);
    const [retryError, setRetryError] = useState('');

    const handleRetry = async () => {
        setRetrying(true);
        setRetryError('');
        try {
            await startRound({ quizCode: quizId, quiz: baseQuiz, studentId: student.id, nisn: student.nisn, navigate });
        } catch (err) {
            setRetryError(verifyErrorMessage(err));
            setRetrying(false);
        }
    };

    if (!result || !quiz) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full border border-gray-100"><AlertCircle className="mx-auto text-red-500 mb-4" size={44} /><h2 className="text-xl font-bold mb-2 text-gray-900">Sesi Berakhir</h2><p className="text-gray-500 text-sm">Hasil kuis tidak ditemukan.</p></div>
        </div>
    );

    const getFeedbackMessage = () => {
        if (result.score >= 80) return `Luar biasa, ${result.student_name}! Pertahankan prestasimu.`;
        if (result.score >= 60) return `Kerja bagus, ${result.student_name}! Kamu sudah memahami materi.`;
        return `Tetap semangat, ${result.student_name}! Yuk, belajar lebih giat lagi.`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* HEADER SERAGAM */}
            <header className="bg-white px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-7 sm:h-9 w-auto" />
                    <h1 className="font-bold text-gray-900 tracking-tight text-sm sm:text-base hidden sm:block">SIT FITHRAH INSANI</h1>
                </div>
                <div className="font-bold text-gray-400 text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Laporan Kuis</div>
            </header>

            {/* KONTEN SERAGAM */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-center relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-sm border-4 ${result.score >= 70 ? 'bg-green-50 border-green-100 text-[#1b6d39]' : 'bg-red-50 border-red-100 text-red-500'}`}>
                            {result.score >= 70 ? <Trophy size={40} /> : <AlertCircle size={40} />}
                        </div>
                        <p className="text-gray-500 font-medium text-xs sm:text-sm mb-1">{round > 1 ? 'Ronde ' + round + ' selesai,' : 'Kuis Selesai,'}</p>
                        <h2 className="text-xl sm:text-3xl font-black text-gray-900 mb-5 sm:mb-6">{result.student_name}</h2>
                        
                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-4 border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{canRetry ? 'Skor Sementara (semua ronde)' : 'Skor Akhir'}</p>
                            <div className={`text-6xl sm:text-7xl font-black ${result.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>{result.score}</div>
                            {round > 1 && roundQuestionCount != null && (
                                <p className="text-xs font-semibold text-gray-500 mt-2">Ronde ini: {roundCorrect} dari {roundQuestionCount} soal benar</p>
                            )}
                        </div>

                        <p className={`text-xs sm:text-sm font-bold text-gray-700 px-2 ${remainingAttempts != null ? 'mb-2' : 'mb-6 sm:mb-8'}`}>{getFeedbackMessage()}</p>
                        {remainingAttempts != null && (
                            <p className="text-xs font-semibold text-gray-500 mb-6 sm:mb-8">
                                {remainingAttempts > 0 ? `Sisa kesempatan mengerjakan: ${remainingAttempts} kali` : 'Kesempatan mengerjakan kuis ini sudah habis.'}
                            </p>
                        )}

                        {canRetry && student && baseQuiz && (
                            <div className="mb-6 sm:mb-8 bg-orange-50 border border-orange-100 rounded-xl p-4 text-left">
                                <p className="text-xs sm:text-sm font-bold text-orange-800 mb-1">Masih ada {remainingWrong} soal yang belum benar.</p>
                                <p className="text-xs text-orange-700 mb-3">Di ronde berikutnya hanya soal-soal itu yang muncul. Kunci jawabannya ditampilkan setelah semua benar atau kesempatan habis.</p>
                                {retryError && <p className="text-xs font-bold text-red-600 mb-2">{retryError}</p>}
                                <button onClick={handleRetry} disabled={retrying} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-sm disabled:opacity-50">
                                    {retrying ? <Loader2 className="animate-spin" size={18} /> : <RotateCcw size={18} />} Ulangi {remainingWrong} soal yang belum benar
                                </button>
                            </div>
                        )}
                        {!canRetry && remainingWrong === 0 && round > 1 && (
                            <p className="mb-6 sm:mb-8 text-xs sm:text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">Semua soal kuis ini sudah kamu jawab benar. Hebat!</p>
                        )}

                        <div className="grid grid-cols-3 gap-2 sm:gap-6">
                            <div className="bg-green-50 rounded-xl p-3 sm:p-4 flex flex-col items-center border border-green-100">
                                <CheckCircle2 className="text-green-500 mb-1" size={20} />
                                <span className="text-lg sm:text-2xl font-black text-green-700">{result.correct_answers}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-green-600 uppercase mt-1">{round > 1 ? 'Sudah benar' : 'Benar'}</span>
                            </div>
                            <div className="bg-red-50 rounded-xl p-3 sm:p-4 flex flex-col items-center border border-red-100">
                                <XCircle className="text-red-500 mb-1" size={20} />
                                <span className="text-lg sm:text-2xl font-black text-red-700">{result.wrong_answers}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase mt-1">{round > 1 ? 'Belum benar' : 'Salah'}</span>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 flex flex-col items-center border border-blue-100">
                                <Clock className="text-blue-500 mb-1" size={20} />
                                <span className="text-base sm:text-xl font-black text-blue-700 mt-0.5">{formatDuration(result.time_spent_seconds)}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase mt-1">Waktu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900">{round > 1 ? 'Pembahasan Ronde ' + round : 'Pembahasan Soal'}</h3>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{quiz.questions?.length} Soal</span>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                        {quiz.questions?.map((q, index) => {
                            const selectedOptionId = studentAnswers?.[q.id];
                            const selectedOption = q.options?.find(o => o.id === selectedOptionId);
                            const correctOption = q.options?.find(o => o.is_correct);
                            const isCorrect = !q.key_hidden && selectedOption?.is_correct === true;

                            return (
                                <div key={q.id} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-5">
                                        <div className="flex">
                                            <div className={`inline-flex items-center justify-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold border ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {isCorrect ? '✓ JAWABAN BENAR' : '✗ JAWABAN SALAH'}
                                            </div>
                                        </div>
                                        <h4 className="text-gray-900 font-bold text-sm sm:text-lg leading-relaxed mt-1">
                                            <span className="text-gray-400 mr-2">{index + 1}.</span> {q.question_text}
                                        </h4>
                                    </div>

                                    <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        <div className={`flex-1 p-3 sm:p-4 rounded-xl border ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jawaban Kamu</span>
                                            <span className={`font-semibold text-xs sm:text-base ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{selectedOption ? selectedOption.option_text : 'Tidak dijawab'}</span>
                                        </div>
                                        {!isCorrect && !q.key_hidden && correctOption && (
                                            <div className="flex-1 p-3 sm:p-4 rounded-xl border bg-blue-50/50 border-blue-100">
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kunci Jawaban</span>
                                                <span className="font-semibold text-xs sm:text-base text-blue-700">{correctOption.option_text}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {q.key_hidden ? (
                                        <div className="flex items-start gap-2 bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100 text-xs sm:text-sm text-orange-800">
                                            <Lock size={16} className="shrink-0 mt-0.5" />
                                            <span>Belum benar. Soal ini akan muncul lagi di ronde berikutnya, jadi kunci dan pembahasannya belum ditampilkan.</span>
                                        </div>
                                    ) : (
                                    <div className="w-full">
                                        <div className="bg-gray-50 p-3 sm:p-5 rounded-xl border border-gray-200 text-xs sm:text-base text-gray-700 leading-relaxed">
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                                <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-[#1b6d39] rounded-full"></div>
                                                <strong className="text-gray-900">Penjelasan</strong>
                                            </div>
                                            <p className="pl-2.5 sm:pl-3.5">{q.explanation || 'Tidak ada penjelasan khusus.'}</p>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}