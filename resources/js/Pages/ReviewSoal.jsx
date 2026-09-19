import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ReviewSoal() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isPublishing, setIsPublishing] = useState(false);

    const { quizInfo, generatedQuestions } = location.state || {};

    if (!quizInfo || !generatedQuestions) {
        return (
            <AdminLayout>
                <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Oops, tidak ada soal yang sedang di-review.</h2>
                    <button onClick={() => navigate('/generate')} className="bg-[#1b6d39] hover:bg-[#14532b] text-white px-8 py-3 rounded-xl font-bold transition-all mt-6">
                        Kembali ke Form Kuis
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const response = await axios.post('/api/quizzes', {
                quizInfo: quizInfo,
                questions: generatedQuestions
            });
            
            navigate('/dibagikan', { 
                state: { quiz: response.data.quiz } 
            });
        } catch (error) {
            alert("Gagal menyimpan kuis. Silakan coba lagi.");
            setIsPublishing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Generate Quiz / Review</div>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Review hasil generate AI</h1>
                    <p className="text-gray-500">Periksa soal sebelum kuis dipublikasikan untuk {quizInfo.kelas}.</p>
                </div>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-full">{generatedQuestions.length} soal</span>
                    <span className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-semibold text-sm rounded-full">{quizInfo.mapel}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-semibold text-sm rounded-xl border border-orange-100 shadow-sm">
                    <Sparkles size={16} />
                    AI membantu, Anda tetap menentukan.
                </div>
            </div>

            <div className="space-y-6 mb-24">
                {generatedQuestions.map((soal, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-[#1b6d39] transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xs font-bold text-gray-400 tracking-wider">SOAL {index + 1}</div>
                            <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Pilihan Ganda</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-5 leading-relaxed">{soal.question_text}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-6">
                            {soal.options.map((opt, i) => (
                                <div key={i} className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                                    opt.is_correct 
                                    ? 'border-[#1b6d39] bg-green-50 text-green-800 font-bold' 
                                    : 'border-gray-100 bg-gray-50 font-medium'
                                }`}>
                                    <span>
                                        <span className="mr-2">{String.fromCharCode(65 + i)}.</span> 
                                        {opt.option_text}
                                    </span>
                                    {opt.is_correct && (
                                        <span className="bg-[#1b6d39] text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-md">Kunci</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end items-center border-t border-gray-50 pt-4 mt-2">
                            <div className="flex gap-4 text-sm font-semibold">
                                <button className="text-gray-400 hover:text-[#1b6d39] transition-colors">Edit</button>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 right-0 left-64 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 px-8 flex justify-between items-center z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="text-gray-500 font-medium">
                    <strong className="text-gray-900">{generatedQuestions.length}</strong> soal siap dipublikasikan
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/generate')} className="px-6 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        Batal
                    </button>
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-8 py-2.5 rounded-xl bg-[#1b6d39] text-white font-bold hover:bg-[#14532b] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none transform active:scale-95"
                    >
                        {isPublishing ? 'Menyimpan...' : 'Publikasikan Sekarang'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}