import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';

export default function StudentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, quiz } = location.state || {};

    if (!result || !quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-gray-500 font-bold mb-4">Hasil kuis tidak ditemukan.</p>
                    <button onClick={() => navigate('/')} className="bg-[#1b6d39] text-white px-6 py-2.5 rounded-xl font-bold">Ke Halaman Awal</button>
                </div>
            </div>
        );
    }

    const getFeedback = (score) => {
        if (score >= 85) return { title: "Luar Biasa! 🏆", message: "Kerja sangat bagus! Pertahankan prestasimu.", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
        if (score >= 70) return { title: "Kerja Bagus! 👍", message: "Hasil yang memuaskan. Tingkatkan terus belajarmu!", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
        if (score >= 50) return { title: "Tetap Semangat! 💪", message: "Cukup baik, tapi mari belajar lebih giat lagi ya.", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" };
        return { title: "Jangan Menyerah! 📚", message: "Yuk pelajari lagi materinya, kamu pasti bisa lebih baik!", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" };
    };

    const feedback = getFeedback(result.score);
    
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center font-sans py-8 px-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="bg-[#1b6d39] p-8 text-center text-white relative">
                    <h1 className="text-xl font-bold opacity-90 mb-1">{quiz.title}</h1>
                    <p className="text-green-100 text-sm font-medium">Kuis Selesai Dikerjakan</p>
                </div>

                <div className="p-8">
                    <div className="text-center -mt-16 relative z-10 mb-6">
                        <div className="h-28 w-28 bg-white rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center flex-col relative overflow-hidden">
                            <div className="text-4xl font-black text-[#1b6d39]">{result.score}</div>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-2xl font-bold text-gray-900">{result.student_name}</h2>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border mb-8 text-center ${feedback.bg} ${feedback.border}`}>
                        <h3 className={`text-lg font-bold mb-1 ${feedback.color}`}>{feedback.title}</h3>
                        <p className="text-sm font-medium text-gray-600">{feedback.message}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
                            <div className="text-2xl font-bold text-green-700">{result.correct_answers}</div>
                            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Benar</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                            <XCircle className="mx-auto text-red-400 mb-2" size={24} />
                            <div className="text-2xl font-bold text-red-600">{result.wrong_answers}</div>
                            <div className="text-xs font-semibold text-red-500 uppercase tracking-wide">Salah</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                            <Clock className="mx-auto text-blue-400 mb-2" size={24} />
                            <div className="text-xl font-bold text-blue-700 mt-1">{formatTime(result.time_spent_seconds)}</div>
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mt-1">Waktu</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} /> Tutup & Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}