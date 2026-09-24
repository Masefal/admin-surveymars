import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function StudentLanding() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`/api/student/quiz/${quizId}`)
            .then(response => {
                setQuiz(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Kuis tidak ditemukan atau sudah tidak aktif.');
                setLoading(false);
            });
    }, [quizId]);

    const handleStart = () => {
        if (!studentName.trim()) {
            alert('Silakan masukkan namamu terlebih dahulu!');
            return;
        }
        
        navigate(`/q/${quizId}/play`, {
            state: { 
                quiz: quiz,
                studentName: studentName 
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans p-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#1b6d39]" size={40} />
                    <p className="font-bold text-gray-500 text-sm">Mencari Kuis...</p>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans p-4 sm:p-6">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
                    <div className="text-4xl mb-4">🕵️‍♂️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">
                <header className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" 
                            alt="Logo Sekolah" 
                            className="h-8 w-8"
                        />
                        <h1 className="font-bold text-gray-900 tracking-tight text-xs sm:text-sm">
                            SIT FITHRAH INSANI
                        </h1>
                    </div>
                </header>

                <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-[#1b6d39] rounded-2xl p-5 sm:p-6 text-white mb-6 sm:mb-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute -left-4 -bottom-8 w-20 h-20 bg-white opacity-10 rounded-full"></div>
                        
                        <div className="relative z-10">
                            <span className="inline-block bg-[#F2994A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3">
                                Kuis Baru
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                                Siap untuk menguji pengetahuanmu?
                            </h2>
                        </div>
                    </div>

                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1.5 leading-tight">
                            {quiz.subject?.name} — {quiz.title}
                        </h3>
                        <p className="text-gray-500 font-medium text-xs sm:text-sm mb-4">
                            {quiz.student_class?.name}
                        </p>

                        <div className="flex flex-wrap gap-2.5 sm:gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                                <BookOpen size={16} className="text-gray-400" />
                                <span className="text-xs sm:text-sm font-bold text-gray-700">{quiz.questions?.length || 0} Soal</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                                <Clock size={16} className="text-gray-400" />
                                <span className="text-xs sm:text-sm font-bold text-gray-700">{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} Menit` : 'Tanpa Batas'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                        <div className="mb-4 sm:mb-5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                                Nama Lengkap
                            </label>
                            <input 
                                type="text" 
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Masukkan namamu di sini..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#1b6d39] focus:border-transparent transition-all font-medium text-sm text-gray-900 placeholder:text-gray-400 outline-none" 
                            />
                        </div>
                        <button 
                            onClick={handleStart}
                            className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-3.5 sm:py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98] text-sm sm:text-base shadow-sm"
                        >
                            Mulai Mengerjakan <ArrowRight size={18} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}