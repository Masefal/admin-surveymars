import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Loader2, BookOpen, Users, FileText, Target, ListOrdered, AlertCircle, RotateCcw, Lock } from 'lucide-react';
import AdminLayout from '../Layouts/AdminLayout';
import { ATTEMPT_OPTIONS } from '../attempts';

export default function GenerateQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    // Dikirim dari tombol "Generate Remedial AI" di Detail Kuis
    const remedial = location.state?.remedial || null;
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isParent = user?.role === 'orang_tua';

    // Remedial dari Detail Kuis: siswa, kelas, dan mapel sudah pasti, jadi dikunci
    const isRemedial = !!remedial?.student;

    const [formData, setFormData] = useState({
        class_id: remedial?.classId || '',
        subject_id: remedial?.subjectId || '',
        target_student_id: remedial?.student?.student_id || '',
        topic: remedial ? `Remedial ${remedial.title}` : '',
        context: '',
        num_questions: 5,
        max_attempts: '1'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masterRes, studentsRes] = await Promise.all([
                    axios.get('/api/master-data'),
                    axios.get('/api/students')
                ]);
                
                const masterData = masterRes.data;
                setClasses(Array.isArray(masterData.classes) ? masterData.classes : (Array.isArray(masterData) ? masterData : []));
                setSubjects(Array.isArray(masterData.subjects) ? masterData.subjects : []);
                
                const studentData = studentsRes.data;
                const fetchedStudents = Array.isArray(studentData) ? studentData : (Array.isArray(studentData.data) ? studentData.data : []);
                setStudents(fetchedStudents);

                if (isParent && !isRemedial && fetchedStudents.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        class_id: fetchedStudents[0].student_class_id,
                        target_student_id: fetchedStudents[0].id
                    }));
                }
            } catch (err) {
                setError('Gagal memuat data master.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isParent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'class_id' && !isParent) next.target_student_id = '';
            // Untuk orang tua, kelas selalu mengikuti anak yang dipilih
            if (name === 'target_student_id' && isParent) {
                next.class_id = students.find(s => s.id === parseInt(value))?.student_class_id || '';
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setError('');

        const subject = subjects.find(s => s.id === parseInt(formData.subject_id));
        const target = students.find(s => s.id === parseInt(formData.target_student_id))
            || (isRemedial ? { id: remedial.student.student_id, name: remedial.student.student_name, student_class_id: remedial.classId } : null);
        const classId = target ? target.student_class_id : parseInt(formData.class_id);
        const studentClass = classes.find(c => c.id === classId);

        try {
            const response = await axios.post('/api/generate-quiz', {
                mapel: subject?.name,
                subject_id: subject?.id,
                kelas: studentClass?.name,
                topik: formData.topic,
                deskripsi: formData.context,
                jumlah_soal: parseInt(formData.num_questions),
                student_id: target?.id || null
            });

            navigate('/review', {
                state: {
                    quizInfo: {
                        subject_id: subject?.id,
                        student_class_id: classId,
                        target_student_id: target?.id || null,
                        target_name: target?.name || null,
                        topik: formData.topic,
                        deskripsi: formData.context,
                        max_attempts: formData.max_attempts ? parseInt(formData.max_attempts) : null,
                        mapel: subject?.name,
                        kelas: studentClass?.name
                    },
                    generatedQuestions: response.data
                }
            });
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Gagal menghasilkan kuis.');
            setIsGenerating(false);
        }
    };

    const filteredStudents = students.filter(s => s.student_class_id === parseInt(formData.class_id));

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex justify-center items-center">
                    <Loader2 className="animate-spin text-[#1b6d39]" size={40} />
                </div>
            </AdminLayout>
        );
    }

    if (isParent && students.length === 0) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex justify-center items-center p-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full border border-gray-100">
                        <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Anak Belum Terhubung</h2>
                        <p className="text-gray-500 mb-6">Anda harus menghubungkan data anak terlebih dahulu di menu Pantau Anak sebelum dapat membuat kuis.</p>
                        <button onClick={() => navigate('/pantau-anak')} className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3.5 rounded-xl transition-all">
                            Pergi ke Menu Pantau Anak
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Manajemen / Generate Kuis AI</div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                    <Sparkles className="text-[#1b6d39]" /> Generate Kuis AI
                </h1>
                <p className="text-gray-500">Buat soal otomatis dengan kecerdasan buatan.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    
                    {isRemedial ? (
                        <div className="bg-orange-50/60 border border-orange-200 p-5 rounded-xl">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-orange-800">
                                    <Target size={18} /> Kuis Remedial Personal
                                </label>
                                
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Siswa', value: `${remedial.student.student_name} (nilai ${remedial.student.score})` },
                                    { label: 'Kelas', value: remedial.className || classes.find(c => c.id === remedial.classId)?.name || '-' },
                                    { label: 'Mata Pelajaran', value: remedial.subjectName || subjects.find(s => s.id === remedial.subjectId)?.name || '-' },
                                ].map(item => (
                                    <div key={item.label} className="bg-white border border-orange-100 rounded-xl px-4 py-3">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</div>
                                        <div className="font-bold text-gray-900 text-sm mt-0.5">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-orange-700 mt-3">
                                Diambil dari kuis "{remedial.title}". Untuk siswa lain, kembali ke{' '}
                                <button type="button" onClick={() => navigate(-1)} className="font-bold underline">Detail Kuis</button>.
                            </p>
                        </div>
                    ) : isParent ? (
                        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl">
                            <label className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                                 <Sparkles size={20} />Kuis Personalisasi Untuk Anak Anda
                            </label>
                            {students.length > 1 ? (
                                <select
                                    name="target_student_id"
                                    value={formData.target_student_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3.5 font-bold text-blue-900 shadow-sm outline-none"
                                >
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — {s.student_class?.name || 'Kelas Tidak Diketahui'}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-white border border-blue-200 rounded-xl px-4 py-3.5 font-bold text-blue-900 shadow-sm">
                                    {students[0]?.name} — {students[0]?.student_class?.name || 'Kelas Tidak Diketahui'}
                                </div>
                            )}
                            <p className="text-xs text-blue-700 mt-2">Soal disusun dari materi yang sebelumnya dijawab salah, dan hanya bisa dikerjakan oleh anak ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Users size={18} className="text-blue-500" /> Kelas
                                </label>
                                <select
                                    name="class_id"
                                    value={formData.class_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none bg-white font-medium text-gray-700"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <Target size={18} className="text-blue-500" /> Target Siswa
                                </label>
                                <select
                                    name="target_student_id"
                                    value={formData.target_student_id}
                                    onChange={handleChange}
                                    disabled={!formData.class_id}
                                    className={`w-full border-2 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-0 outline-none font-medium ${!formData.class_id ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-200 bg-white text-gray-700'}`}
                                >
                                    <option value="">-- Kuis untuk Semua Siswa --</option>
                                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {!isRemedial && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <BookOpen size={18} className="text-green-500" /> Mata Pelajaran
                            </label>
                            <select
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleChange}
                                required
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none bg-white font-medium text-gray-700"
                            >
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <FileText size={18} className="text-orange-500" /> Topik Kuis (Nama Kuis)
                        </label>
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Bangun Datar dan Ruang"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none font-medium text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <FileText size={18} className="text-purple-500" /> Deskripsi / Konteks untuk AI
                        </label>
                        <textarea
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                            required
                            rows="3"
                            placeholder="Tuliskan konteks spesifik. Contoh: Buatkan soal cerita matematika yang berhubungan dengan kegiatan sehari-hari di pasar..."
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none font-medium text-gray-700 resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <ListOrdered size={18} className="text-pink-500" /> Jumlah Soal
                        </label>
                        <input
                            type="number"
                            name="num_questions"
                            value={formData.num_questions}
                            onChange={handleChange}
                            required
                            min="1"
                            max="20"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none font-medium text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <RotateCcw size={18} className="text-teal-500" /> Kesempatan Mengerjakan per Siswa
                        </label>
                        <select
                            name="max_attempts"
                            value={formData.max_attempts}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:ring-0 outline-none bg-white font-medium text-gray-700"
                        >
                            {ATTEMPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isGenerating || !formData.class_id || !formData.subject_id}
                            className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={20} /> AI Sedang Merakit Kuis...</>
                            ) : (
                                <><Sparkles size={20} /> Generate Kuis Sekarang</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}