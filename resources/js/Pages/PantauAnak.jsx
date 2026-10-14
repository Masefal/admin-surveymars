import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as LinkIcon, AlertCircle, Loader2, User, FileText, CheckCircle2, XCircle, Clock, BarChart2, TrendingDown, Award } from 'lucide-react';
import AdminLayout from '../Layouts/AdminLayout';

export default function PantauAnak() {
    const [student, setStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLinking, setIsLinking] = useState(false);
    const [nisn, setNisn] = useState('');
    const [error, setError] = useState('');

    const fetchLinkedStudent = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/parent/linked-student');
            if (response.data && response.data.student) {
                setStudent(response.data.student);
                setResults(response.data.results || []);
            } else {
                setStudent(null);
            }
        } catch (err) {
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinkedStudent();
    }, []);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        setIsLinking(true);
        setError('');

        try {
            await axios.post('/api/parent/link', { nisn: nisn });
            fetchLinkedStudent();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghubungkan. Pastikan NISN benar dan terdaftar.');
            setIsLinking(false);
        }
    };

    const getAcademicStats = () => {
        if (!results.length) return { average: 0, weakSubjects: [] };
        
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
        const average = Math.round(totalScore / results.length);
        
        const subjectStats = {};
        results.forEach(r => {
            const subj = r.quiz?.subject?.name || 'Umum';
            if (!subjectStats[subj]) subjectStats[subj] = { total: 0, count: 0 };
            subjectStats[subj].total += r.score;
            subjectStats[subj].count += 1;
        });
        
        const weakSubjects = Object.keys(subjectStats)
            .map(subj => ({ name: subj, avg: Math.round(subjectStats[subj].total / subjectStats[subj].count) }))
            .filter(s => s.avg < 75)
            .sort((a, b) => a.avg - b.avg);
            
        return { average, weakSubjects };
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex justify-center items-center">
                    <Loader2 className="animate-spin text-[#1b6d39]" size={40} />
                </div>
            </AdminLayout>
        );
    }

    const stats = getAcademicStats();

    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Dasbor Orang Tua / Pantau Nilai Anak</div>
            
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                    <BarChart2 className="text-[#1b6d39]" /> Pantau Nilai Anak
                </h1>
                <p className="text-gray-500">Pantau perkembangan, nilai rata-rata, dan evaluasi hasil belajar anak Anda.</p>
            </div>

            {!student ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LinkIcon className="text-[#1b6d39]" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Hubungkan Data Anak</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Anda belum menghubungkan data peserta didik ke akun Anda. Silakan masukkan NISN anak Anda untuk melihat laporan nilai.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-bold text-left">
                            <AlertCircle size={18} className="shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLinkStudent} className="max-w-sm mx-auto">
                        <div className="mb-3">
                            <input
                                type="text"
                                value={nisn}
                                onChange={(e) => setNisn(e.target.value)}
                                placeholder="Masukkan NISN Anak"
                                required
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] focus:ring-0 outline-none font-medium text-gray-700 text-center tracking-widest"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mb-5">
                            💡 Lupa atau tidak tahu NISN? Anda dapat melihatnya pada buku Rapor anak, atau silakan hubungi Wali Kelas.
                        </p>
                        <button
                            type="submit"
                            disabled={isLinking || !nisn}
                            className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLinking ? <Loader2 className="animate-spin" size={20} /> : 'Hubungkan Sekarang'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border-4 border-blue-100">
                            <User className="text-blue-500" size={32} />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">{student.name}</h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-bold text-gray-500">
                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-700">NISN: {student.nisn}</span>
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100">{student.student_class?.name || 'Tidak ada kelas'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${stats.average >= 75 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                <Award size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Nilai</p>
                                <div className="flex items-end gap-2">
                                    <span className={`text-4xl font-black ${stats.average >= 75 ? 'text-green-600' : 'text-orange-600'}`}>{stats.average}</span>
                                    <span className="text-gray-500 font-medium mb-1">/ 100</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                                <TrendingDown size={32} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Perlu Ditingkatkan</p>
                                {stats.weakSubjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {stats.weakSubjects.map((ws, i) => (
                                            <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-sm font-bold">
                                                📚 {ws.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 px-3 py-1.5 rounded-lg inline-block border border-green-100">
                                        Semua mata pelajaran baik! (≥75)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <FileText className="text-[#1b6d39]" size={20} /> Riwayat Kuis
                            </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Kuis</th>
                                        <th scope="col" className="px-6 py-4 text-center">Nilai</th>
                                        <th scope="col" className="px-6 py-4 text-center">Detail</th>
                                        <th scope="col" className="px-6 py-4 text-right">Waktu Pengerjaan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((result) => (
                                            <tr key={result.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    <span className="block">{result.quiz?.title || 'Kuis tidak diketahui'}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{result.quiz?.subject?.name || 'Umum'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-black ${result.score >= 70 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                                        {result.score}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={16}/> {result.correct_answers}</span>
                                                        <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={16}/> {result.wrong_answers}</span>
                                                        <span className="flex items-center gap-1 text-blue-500 font-bold"><Clock size={16}/> {Math.floor(result.time_spent_seconds / 60)}m</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs font-medium text-gray-400">
                                                    {new Date(result.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">
                                                Anak Anda belum mengerjakan kuis apa pun.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}