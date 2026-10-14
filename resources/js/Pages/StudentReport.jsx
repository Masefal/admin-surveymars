import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowLeft, BookOpen, Target, Trophy, Clock, AlertCircle } from 'lucide-react';

export default function StudentReport() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/students/${id}/report`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div></div></AdminLayout>;
    if (!data || !data.student) return <AdminLayout><div className="p-10 text-center font-bold text-red-500">Data siswa tidak ditemukan.</div></AdminLayout>;

    const { student, history } = data;
    const totalQuizzes = history.length;
    const averageScore = totalQuizzes > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes) : 0;
    const needsHelp = averageScore < 70 && totalQuizzes > 0;

    return (
        <AdminLayout>
            <Link to="/kelola-siswa" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1b6d39] mb-6 font-semibold text-sm transition-colors">
                <ArrowLeft size={16} /> Kembali ke Kelola Siswa
            </Link>

            <div className="bg-[#1b6d39] rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">{student.name}</h1>
                        <p className="text-green-100 font-medium">Kelas: {student.student_class?.name || '-'}</p>
                    </div>
                    {needsHelp && (
                        <div className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm border border-red-400">
                            <AlertCircle size={18} /> Butuh Perhatian Khusus
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><BookOpen size={24} /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{totalQuizzes}</div>
                        <div className="text-sm text-gray-500 font-medium">Kuis Dikerjakan</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><Trophy size={24} /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{averageScore}</div>
                        <div className="text-sm text-gray-500 font-medium">Rata-rata Keseluruhan</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Riwayat Kuis</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs sm:text-sm border-b border-gray-100">
                                <th className="p-4 font-bold">Topik Kuis</th>
                                <th className="p-4 font-bold">Mata Pelajaran</th>
                                <th className="p-4 font-bold text-center">Waktu</th>
                                <th className="p-4 font-bold text-right">Skor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map((res, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                    <td className="p-4 font-bold text-gray-900">{res.quiz?.title || 'Kuis Dihapus'}</td>
                                    <td className="p-4 text-gray-600">{res.quiz?.subject?.name || '-'}</td>
                                    <td className="p-4 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Clock size={14}/> {Math.floor(res.time_spent_seconds / 60)}m {res.time_spent_seconds % 60}s
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-black shadow-xs ${res.score >= 70 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {res.score}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">Siswa ini belum mengerjakan kuis apa pun.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}