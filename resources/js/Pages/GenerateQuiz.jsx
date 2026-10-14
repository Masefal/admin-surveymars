import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function GenerateQuiz() {
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isOrtu = user.role === 'orang_tua';
    
    const [formData, setFormData] = useState({
        mapel: '',
        kelas: '',
        topik: '',
        deskripsi: '',
        jumlah_soal: 5,
        student_id: ''
    });

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/master-data')
            .then(response => {
                setSubjects(response.data.subjects);
                setClasses(response.data.classes);
                if (response.data.subjects.length > 0) {
                    setFormData(prev => ({ ...prev, mapel: response.data.subjects[0].name }));
                }
                if (!isOrtu && response.data.classes.length > 0) {
                    setFormData(prev => ({ ...prev, kelas: response.data.classes[0].name }));
                }
            })
            .catch(err => console.error(err));

        axios.get('/api/students')
            .then(res => {
                setStudents(res.data);
                if (isOrtu && res.data.length > 0) {
                    const firstChild = res.data[0];
                    setFormData(prev => ({
                        ...prev,
                        student_id: firstChild.id,
                        kelas: firstChild.student_class?.name || 'Tanpa Kelas'
                    }));
                }
            })
            .catch(err => console.error(err));
    }, [isOrtu]);

    const handleChildChange = (e) => {
        const childId = e.target.value;
        const selectedChild = students.find(s => s.id == childId);
        setFormData(prev => ({
            ...prev,
            student_id: childId,
            kelas: selectedChild?.student_class?.name || prev.kelas
        }));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = { ...formData };
        if (payload.student_id === '') {
            payload.student_id = null;
        }

        try {
            const response = await axios.post('/api/generate-quiz', payload);
            navigate('/review', { state: { quizInfo: formData, generatedQuestions: response.data } });
        } catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan sistem saat menghubungi AI.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Generate / Buat Kuis Baru</div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-[#2c6de7]" /> Buat Kuis dengan AI
            </h1>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <span className="font-medium text-sm">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl">
                        <label className="block text-sm font-extrabold text-blue-900 mb-2">
                            {isOrtu ? 'Pilih Anak Anda' : 'Target Siswa (Personalisasi AI)'}
                        </label>
                        {isOrtu ? (
                            <select
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChildChange}
                                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-bold"
                                required
                            >
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                            >
                                <option value="">-- Kuis Umum (Tidak ditargetkan untuk siswa tertentu) --</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} - {student.student_class?.name || 'Tanpa Kelas'}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-blue-600 mt-2 flex items-start gap-1">
                            <Sparkles size={14} className="shrink-0 mt-0.5" />
                            {isOrtu 
                                ? 'AI akan menyesuaikan tingkat kesulitan berdasarkan riwayat belajar anak Anda.'
                                : 'Jika nama siswa dipilih, AI otomatis mencari materi yang belum dipahami oleh anak tersebut.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mata Pelajaran</label>
                            <select 
                                name="mapel" 
                                value={formData.mapel} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1b6d39] focus:border-[#1b6d39] text-sm bg-white"
                            >
                                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kelas</label>
                            {isOrtu ? (
                                <input 
                                    type="text"
                                    value={formData.kelas || ''} 
                                    readOnly
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold cursor-not-allowed"
                                />
                            ) : (
                                <select 
                                    name="kelas" 
                                    value={formData.kelas} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1b6d39] focus:border-[#1b6d39] text-sm bg-white"
                                >
                                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topik Kuis (Nama Quiz)</label>
                        <input
                            type="text"
                            required
                            name="topik"
                            value={formData.topik}
                            onChange={handleChange}
                            placeholder="Contoh: Bangun Datar dan Ruang"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1b6d39] focus:border-[#1b6d39] text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi / Konteks untuk AI</label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            placeholder="Tuliskan konteks spesifik untuk AI. Contoh: Buatkan soal cerita matematika yang berhubungan dengan kegiatan sehari-hari di pasar, tingkat kesulitan sedang."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-sm resize-y"
                            rows="4"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Soal</label>
                        <input 
                            type="number"
                            min="1"
                            max="50"
                            required
                            name="jumlah_soal" 
                            value={formData.jumlah_soal} 
                            onChange={handleChange} 
                            placeholder="Masukkan jumlah soal (maks 50)"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1b6d39] focus:border-[#1b6d39] text-sm bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1b6d39] hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                AI Sedang Berpikir...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Kuis Sekarang
                            </>
                        )}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}