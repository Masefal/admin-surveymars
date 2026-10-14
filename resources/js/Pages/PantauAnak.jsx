import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { LineChart, Loader2, AlertCircle, BookOpen, Trophy, Clock, User, ChevronRight, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react';

export default function PantauAnak() {
    const [children, setChildren] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentToLink, setSelectedStudentToLink] = useState('');
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchMyChildren = () => {
        setLoading(true);
        axios.get('/api/students')
            .then(res => {
                const myChildren = res.data;
                setChildren(myChildren);
                if (myChildren.length > 0) {
                    setSelectedChildId(myChildren[0].id);
                } else {
                    fetchAllStudents();
                    setLoading(false);
                }
            })
            .catch(err => {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            });
    };

    const fetchAllStudents = () => {
        axios.get('/api/students?all=true')
            .then(res => setAllStudents(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchMyChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            setLoading(true);
            axios.get(`/api/students/${selectedChildId}/report`)
                .then(res => setReportData(res.data))
                .catch(err => setError(err.response?.data?.error || "Gagal mengambil rapor anak."))
                .finally(() => setLoading(false));
        }
    }, [selectedChildId]);

    const handleLinkChild = async (e) => {
        e.preventDefault();
        if (!selectedStudentToLink) return;
        
        setLinking(true);
        try {
            await axios.post('/api/students/link', { student_id: selectedStudentToLink });
            fetchMyChildren();
        } catch (err) {
            alert(err.response?.data?.error || "Gagal menghubungkan data anak.");
        } finally {
            setLinking(false);
        }
    };

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 border border-red-100 mt-10">
                    <AlertCircle /> <span className="font-semibold">{error}</span>
                </div>
            </AdminLayout>
        );
    }

    if (loading && !reportData && children.length > 0) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center p-20"><Loader2 className="animate-spin text-[#1b6d39]" size={40} /></div>
            </AdminLayout>
        );
    }

    if (children.length === 0 && !loading) {
        return (
            <AdminLayout>
                <div className="mb-4 text-xs sm:text-sm font-medium text-gray-400">Dasbor Orang Tua / Hubungkan Data</div>
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-10 text-center">
                    <div className="h-20 w-20 bg-green-50 text-[#1b6d39] rounded-full flex items-center justify-center mx-auto mb-6">
                        <LinkIcon size={36} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Hubungkan Data Anak</h2>
                    <p className="text-gray-500 mb-8">Anda belum menghubungkan data peserta didik ke akun Anda. Silakan pilih nama anak Anda dari daftar siswa yang terdaftar di sekolah.</p>
                    
                    <form onSubmit={handleLinkChild} className="text-left space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Peserta Didik</label>
                            <select 
                                value={selectedStudentToLink} 
                                onChange={(e) => setSelectedStudentToLink(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#1b6d39] focus:border-[#1b6d39] bg-white"
                                required
                            >
                                <option value="">-- Pilih Nama Anak Anda --</option>
                                {allStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.nisn || s.nis || s.id} - {s.name} - Kelas {s.student_class?.name || ''}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={linking || !selectedStudentToLink}
                            className="w-full bg-[#1b6d39] hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {linking ? <Loader2 className="animate-spin" size={20} /> : 'Hubungkan Sekarang'}
                        </button>
                    </form>
                </div>
            </AdminLayout>
        );
    }

    const { student, history } = reportData || { student: {}, history: [] };
    
    const bestScoresMap = new Map();
    history.forEach(res => {
        const existing = bestScoresMap.get(res.quiz_id);
        if (!existing || res.score > existing.score) {
            bestScoresMap.set(res.quiz_id, res);
        }
    });

    const bestScoresArray = Array.from(bestScoresMap.values());
    const totalUniqueQuizzes = bestScoresArray.length;
    const averageScore = totalUniqueQuizzes > 0 ? Math.round(bestScoresArray.reduce((acc, curr) => acc + curr.score, 0) / totalUniqueQuizzes) : 0;
    const needsHelp = averageScore < 70 && totalUniqueQuizzes > 0;

    return (
        <AdminLayout>
            <div className="mb-4 text-xs sm:text-sm font-medium text-gray-400">Dasbor Orang Tua / Pantau Akademik</div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                        <LineChart className="text-[#1b6d39]" /> Pantau Prestasi Anak
                    </h1>
                    <p className="text-sm text-gray-500">Lihat perkembangan belajar dan riwayat kuis anak Anda secara real-time.</p>
                </div>
                
                {children.length > 1 && (
                    <div className="w-full md:w-auto bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <User size={18} className="text-gray-400 ml-2" />
                        <select 
                            value={selectedChildId} 
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-gray-700 w-full pr-4 text-sm focus:ring-0 cursor-pointer"
                        >
                            {children.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-[#1b6d39] rounded-2xl p-6 sm:p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm gap-6">
                <div className="relative z-10 w-full text-center md:text-left">
                    <h2 className="text-2xl sm:text-4xl font-extrabold mb-2">{student.name}</h2>
                    <p className="text-green-100 font-medium text-sm sm:text-base">Siswa Kelas {student.student_class?.name || '-'}</p>
                </div>
                
                {needsHelp && (
                    <div className="relative z-10 bg-red-500/90 text-white px-5 py-3 rounded-xl flex items-center gap-3 font-bold text-sm shadow-md border border-red-400 w-full justify-center md:w-auto shrink-0">
                        <AlertCircle size={20} /> Anak Anda Butuh Bimbingan Ekstra
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><BookOpen size={28} /></div>
                    <div>
                        <div className="text-3xl font-black text-gray-900">{totalUniqueQuizzes}</div>
                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Topik Dikuasai</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><Trophy size={28} /></div>
                    <div>
                        <div className="text-3xl font-black text-gray-900">{averageScore}</div>
                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Nilai Rata-Rata</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/80">
                    <h3 className="text-lg font-bold text-gray-900">Riwayat Pengerjaan Kuis</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {history.length > 0 ? history.map((res, idx) => (
                        <div key={idx} className="p-5 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{res.quiz?.title || 'Kuis Dihapus'}</h4>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded-md">{res.quiz?.subject?.name || '-'}</span>
                                        <span className="flex items-center gap-1"><Clock size={14}/> {Math.floor(res.time_spent_seconds / 60)}m {res.time_spent_seconds % 60}s</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Skor Akhir</div>
                                        <div className={`text-2xl font-black ${res.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>{res.score}</div>
                                    </div>
                                    <ChevronRight className="text-gray-300 hidden sm:block" size={24} />
                                </div>
                            </div>
                            
                            {res.answers_data && (
                                <div className="mt-4 pt-4 border-t border-gray-50 bg-white rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Detail Analisis Pemahaman</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {JSON.parse(res.answers_data).slice(0, 4).map((ans, i) => (
                                            <div key={i} className={`p-3 rounded-xl border flex gap-3 ${ans.is_correct ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                                <div className="mt-0.5 shrink-0">
                                                    {ans.is_correct ? <CheckCircle2 size={16} className="text-green-600"/> : <XCircle size={16} className="text-red-500"/>}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{ans.question_text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {JSON.parse(res.answers_data).length > 4 && (
                                        <div className="mt-2 text-center text-xs font-bold text-gray-400">
                                            + {JSON.parse(res.answers_data).length - 4} soal lainnya...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="p-10 text-center text-gray-400 font-medium">
                            Anak Anda belum menyelesaikan kuis apa pun.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}