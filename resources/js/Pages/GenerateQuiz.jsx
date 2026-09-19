import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function GenerateQuiz() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        mapel: 'Matematika',
        kelas: 'Kelas IV A',
        topik: 'Bangun Datar',
        deskripsi: 'Latihan mengenal dan memahami bangun datar sederhana.',
        jumlah_soal: 5
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-quiz', formData);
            
            navigate('/review', { 
                state: { 
                    quizInfo: formData,
                    generatedQuestions: response.data 
                } 
            });
        } catch (error) {
            console.error("Error lengkap:", error);
            const errorMsg = error.response?.data?.error || error.message;
            alert("GAGAL: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Generate Quiz / Pengaturan</div>
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Buat quiz baru</h1>
                    <p className="text-gray-500">Atur dasar quiz sebelum soal dibuat dengan AI.</p>
                </div>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <div className="bg-[#1b6d39] text-white px-6 py-3 rounded-xl font-semibold min-w-max">1 Pengaturan Dasar</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-xl font-semibold min-w-max">2 AI Generate</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Quiz</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Mata Pelajaran</label>
                            <input type="text" name="mapel" value={formData.mapel} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Kelas</label>
                            <input type="text" name="kelas" value={formData.kelas} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Topik Kuis (Nama Quiz)</label>
                            <input type="text" name="topik" value={formData.topik} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi / Konteks untuk AI</label>
                            <input type="text" name="deskripsi" value={formData.deskripsi} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Ringkasan</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Kelas & Mapel</div>
                            <div className="font-bold text-gray-900">{formData.kelas} • {formData.mapel}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Jumlah soal yang di-generate</div>
                            <select name="jumlah_soal" value={formData.jumlah_soal} onChange={handleChange} className="font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none">
                                <option value="5">5 Soal (Cepat)</option>
                                <option value="10">10 Soal</option>
                                <option value="20">20 Soal</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="w-full bg-[#1b6d39] hover:bg-[#14532b] disabled:bg-gray-400 transition-colors text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>Menyusun Soal AI... <Loader2 className="animate-spin" size={20} /></>
                        ) : (
                            <>Minta AI Buatkan <ArrowRight size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}