import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Sparkles, ArrowRight, Edit3, Trash2, Check, X } from 'lucide-react';

export default function ReviewSoal() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isPublishing, setIsPublishing] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    const { quizInfo, generatedQuestions: initialQuestions } = location.state || {};
    const [questions, setQuestions] = useState(initialQuestions || []);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState(null);

    if (!quizInfo || !questions.length) {
        return (
            <AdminLayout>
                <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">Oops, tidak ada soal yang sedang di-review.</h2>
                    <button onClick={() => navigate('/generate')} className="bg-[#1b6d39] hover:bg-[#14532b] text-white px-8 py-3 rounded-xl font-bold transition-all mt-6 shadow-sm">
                        Kembali ke Form Kuis
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const handleDeleteSoal = (index) => {
        if(confirm('Yakin ingin menghapus soal ini?')) {
            setQuestions(questions.filter((_, i) => i !== index));
            if (editingIndex === index) {
                handleCancelEdit();
            }
        }
    };

    const handleStartEdit = (index) => {
        setEditingIndex(index);
        setEditForm(JSON.parse(JSON.stringify(questions[index])));
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditForm(null);
    };

    const handleSaveEdit = () => {
        const updated = [...questions];
        updated[editingIndex] = editForm;
        setQuestions(updated);
        setEditingIndex(null);
        setEditForm(null);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const response = await axios.post('/api/quizzes', {
                quizInfo: quizInfo,
                questions: questions
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
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Generate Quiz / Review</div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Review hasil generate AI</h1>
                    <p className="text-sm sm:text-base text-gray-500">Periksa soal sebelum kuis dipublikasikan untuk {quizInfo.kelas}.</p>
                </div>
                <Link to="/pengaturan" className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#1b6d39] text-white items-center justify-center font-bold text-xl sm:text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer shrink-0">
                    {initial}
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <span className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 font-bold text-xs sm:text-sm rounded-full">{questions.length} soal</span>
                    <span className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-600 font-semibold text-xs sm:text-sm rounded-full">{quizInfo.mapel}</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-orange-50 text-orange-600 font-semibold text-xs sm:text-sm rounded-xl border border-orange-100 shadow-xs">
                    <Sparkles size={16} />
                    AI membantu, Anda tetap menentukan.
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-32">
                {questions.map((soal, index) => {
                    if (editingIndex === index) {
                        return (
                            <div key={index} className="bg-white rounded-2xl border-2 border-[#1b6d39] p-4 sm:p-6 shadow-md transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-xs sm:text-sm font-bold text-[#1b6d39] tracking-wider flex items-center gap-2">
                                        <Edit3 size={18} /> MENGEDIT SOAL {index + 1}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Teks Pertanyaan</label>
                                    <textarea 
                                        value={editForm.question_text}
                                        onChange={(e) => setEditForm({...editForm, question_text: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-[#1b6d39] focus:ring-2 focus:ring-[#1b6d39] outline-none transition-all font-medium text-gray-900 text-sm"
                                        rows="3"
                                    />
                                </div>

                                <div className="space-y-3 mb-5">
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Pilihan Jawaban (Pilih radio untuk mengatur kunci jawaban)</label>
                                    {editForm.options.map((opt, i) => (
                                        <div key={i} className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl border ${opt.is_correct ? 'border-[#1b6d39] bg-green-50' : 'border-transparent'}`}>
                                            <input 
                                                type="radio" 
                                                name={`correct_opt_${index}`}
                                                checked={opt.is_correct}
                                                onChange={() => {
                                                    const newOptions = editForm.options.map((o, idx) => ({ ...o, is_correct: idx === i }));
                                                    setEditForm({...editForm, options: newOptions});
                                                }}
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-[#1b6d39] focus:ring-[#1b6d39] cursor-pointer shrink-0"
                                            />
                                            <span className="font-bold text-gray-500 text-sm">{String.fromCharCode(65 + i)}.</span>
                                            <input 
                                                type="text"
                                                value={opt.option_text}
                                                onChange={(e) => {
                                                    const newOptions = [...editForm.options];
                                                    newOptions[i].option_text = e.target.value;
                                                    setEditForm({...editForm, options: newOptions});
                                                }}
                                                className="flex-1 rounded-lg border border-gray-200 p-2 sm:p-2.5 focus:border-[#1b6d39] focus:ring-1 focus:ring-[#1b6d39] outline-none font-medium text-gray-800 bg-white text-xs sm:text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Pembahasan</label>
                                    <textarea 
                                        value={editForm.explanation || ''}
                                        onChange={(e) => setEditForm({...editForm, explanation: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 p-3 focus:border-[#1b6d39] focus:ring-2 focus:ring-[#1b6d39] outline-none transition-all text-xs sm:text-sm text-gray-700"
                                        rows="2"
                                        placeholder="Tambahkan penjelasan mengapa jawaban tersebut benar..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-green-100">
                                    <button onClick={handleCancelEdit} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors text-sm"><X size={18} /> Batal</button>
                                    <button onClick={handleSaveEdit} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b6d39] text-white font-bold hover:bg-[#14532b] flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"><Check size={18} /> Simpan Perubahan</button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:border-gray-300 transition-all">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <div className="text-[11px] sm:text-xs font-bold text-gray-400 tracking-wider">SOAL {index + 1}</div>
                                <div className="text-[11px] sm:text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full">Pilihan Ganda</div>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5 leading-relaxed">{soal.question_text}</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-600 mb-4">
                                {soal.options.map((opt, i) => (
                                    <div key={i} className={`p-3 sm:p-4 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm ${opt.is_correct ? 'border-[#1b6d39] bg-green-50 text-green-800 font-bold' : 'border-gray-100 bg-gray-50 font-medium'}`}>
                                        <span className="pr-2"><span className="mr-1.5 sm:mr-2">{String.fromCharCode(65 + i)}.</span> {opt.option_text}</span>
                                        {opt.is_correct && <span className="bg-[#1b6d39] text-white text-[10px] uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-md shrink-0">Kunci</span>}
                                    </div>
                                ))}
                            </div>

                            {soal.explanation && (
                                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-gray-700">
                                    <strong className="text-blue-800 block mb-1">Pembahasan:</strong> 
                                    {soal.explanation}
                                </div>
                            )}
                            
                            <div className="flex justify-end items-center border-t border-gray-50 pt-3 sm:pt-4 mt-2">
                                <div className="flex gap-4 text-xs sm:text-sm font-semibold">
                                    <button onClick={() => handleStartEdit(index)} className="flex items-center gap-1.5 text-gray-500 hover:text-[#1b6d39] transition-colors"><Edit3 size={16} /> Edit Soal</button>
                                    <button onClick={() => handleDeleteSoal(index)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /> Hapus</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Responsive Action Bar */}
            <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] gap-3">
                <div className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
                    <strong className="text-gray-900">{questions.length}</strong> soal siap dipublikasikan
                </div>
                <div className="flex w-full sm:w-auto gap-2 sm:gap-4 justify-end">
                    <button onClick={() => navigate('/generate')} className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm">Batal</button>
                    <button onClick={handlePublish} disabled={isPublishing || editingIndex !== null} className="flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl bg-[#1b6d39] text-white font-bold hover:bg-[#14532b] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none text-xs sm:text-sm">
                        {isPublishing ? 'Menyimpan...' : 'Publikasikan Sekarang'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}