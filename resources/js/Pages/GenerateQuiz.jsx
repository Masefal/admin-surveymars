import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function GenerateQuiz() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    const [formData, setFormData] = useState({
        mapel: '',
        kelas: '',
        topik: '',
        deskripsi: '',
        jumlah_soal: 5
    });

    useEffect(() => {
        axios.get('/api/master-data')
            .then(response => {
                setSubjects(response.data.subjects);
                setClasses(response.data.classes);
                if (response.data.subjects.length > 0) setFormData(prev => ({ ...prev, mapel: response.data.subjects[0].name }));
                if (response.data.classes.length > 0) setFormData(prev => ({ ...prev, kelas: response.data.classes[0].name }));
            })
            .catch(error => console.error(error));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-quiz', formData);
            navigate('/review', { state: { quizInfo: formData, generatedQuestions: response.data } });
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            alert("GAGAL: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Generate Quiz / Pengaturan</div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Buat quiz baru</h1>
                    <p className="text-sm sm:text-base text-gray-500">Atur dasar quiz sebelum soal dibuat dengan AI.</p>
                </div>
                <Link to="/pengaturan" className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#1b6d39] text-white items-center justify-center font-bold text-xl sm:text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer shrink-0">
                    {initial}
                </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
                <div className="bg-[#1b6d39] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm min-w-max shadow-xs">1 Pengaturan Dasar</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm min-w-max">2 AI Generate</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Informasi Quiz</h3>
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Mata Pelajaran</label>
                            <select name="mapel" value={formData.mapel} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] bg-white text-sm">
                                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Kelas</label>
                            <select name="kelas" value={formData.kelas} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] bg-white text-sm">
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Topik Kuis (Nama Quiz)</label>
                            <input type="text" name="topik" value={formData.topik} onChange={handleChange} placeholder="Misal: Bangun Datar" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Deskripsi / Konteks untuk AI</label>
                            <input type="text" name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Konteks soal (opsional)" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm h-fit">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Ringkasan</h3>
                    <div className="space-y-4 mb-6 sm:mb-8">
                        <div>
                            <div className="text-xs sm:text-sm text-gray-400 mb-1">Kelas & Mapel</div>
                            <div className="font-bold text-gray-900 text-sm sm:text-base">{formData.kelas || '-'} • {formData.mapel || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs sm:text-sm text-gray-400 mb-1">Jumlah soal yang di-generate</div>
                            <select name="jumlah_soal" value={formData.jumlah_soal} onChange={handleChange} className="w-full font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none text-sm">
                                <option value="5">5 Soal (Cepat)</option>
                                <option value="10">10 Soal</option>
                                <option value="20">20 Soal</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={loading || !formData.mapel || !formData.kelas} className="w-full bg-[#1b6d39] hover:bg-[#14532b] disabled:bg-gray-400 transition-colors text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base">
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Menyusun Soal AI...</> : <>Minta AI Buatkan <ArrowRight size={20} /></>}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}