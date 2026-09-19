import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowLeft, Users, Clock, Trophy } from 'lucide-react';

export default function QuizDetail() {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/quizzes/${id}`)
            .then(response => {
                setQuiz(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div></div></AdminLayout>;
    if (!quiz) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold">Kuis tidak ditemukan.</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center gap-4">
                <Link to="/dashboard" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="text-sm font-medium text-gray-400">Beranda / Detail Quiz</div>
            </div>

            <div className="bg-[#1b6d39] rounded-2xl p-8 text-white mb-8 shadow-sm flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                    <p className="text-green-100 font-medium">{quiz.subject?.name} • {quiz.student_class?.name}</p>
                </div>
                <div className="relative z-10 text-right">
                    <div className="text-sm text-green-100 mb-1 font-semibold">Kode Akses</div>
                    <div className="text-2xl font-black tracking-widest bg-white/20 px-4 py-1 rounded-lg">
                        {quiz.share_code}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Rekap Nilai Siswa</h3>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <Users size={16} /> {quiz.student_results?.length || 0} Siswa Mengerjakan
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <th className="p-4 font-bold pl-6">Nama Siswa</th>
                                <th className="p-4 font-bold text-center">Waktu Pengerjaan</th>
                                <th className="p-4 font-bold text-center">Benar / Salah</th>
                                <th className="p-4 font-bold text-right pr-6">Skor Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quiz.student_results?.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                                        Belum ada siswa yang mengerjakan kuis ini.
                                    </td>
                                </tr>
                            ) : (
                                quiz.student_results?.map((result, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-bold text-gray-900 pl-6">{result.student_name}</td>
                                        <td className="p-4 text-center text-sm font-medium text-gray-500">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Clock size={14} className="text-gray-400"/>
                                                {Math.floor(result.time_spent_seconds / 60)}m {result.time_spent_seconds % 60}s
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm font-bold">
                                            <span className="text-green-600">{result.correct_answers}</span>
                                            <span className="text-gray-300 mx-2">/</span>
                                            <span className="text-red-500">{result.wrong_answers}</span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-sm shadow-sm ${
                                                result.score >= 70 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                                {result.score >= 70 && <Trophy size={14} />}
                                                {result.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}