import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowLeft, Users, Clock, Trophy, ChevronDown, ChevronUp, CheckCircle2, XCircle, Send } from 'lucide-react';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        axios.get(`/api/quizzes/${id}`)
            .then(response => { setQuiz(response.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const toggleRow = (idx) => {
        setExpandedRow(expandedRow === idx ? null : idx);
    };

    if (loading) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div></div></AdminLayout>;
    if (!quiz) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold">Kuis tidak ditemukan.</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                <Link to="/quizzes" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"><ArrowLeft size={18} /></Link>
                <div className="text-xs sm:text-sm font-medium text-gray-400">Beranda / Detail Quiz</div>
            </div>

            <div className="bg-[#1b6d39] rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-sm gap-4 sm:gap-6">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{quiz.title}</h1>
                    <p className="text-green-100 text-sm sm:text-base font-medium">{quiz.subject?.name} • {quiz.student_class?.name}</p>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-green-700/50 pt-4 md:border-0 md:pt-0">
                    <button 
                        onClick={() => navigate('/dibagikan', { state: { quiz: quiz } })}
                        className="w-full sm:w-auto bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shrink-0 text-sm sm:text-base"
                    >
                        <Send size={18} /> Bagikan
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Rekap Nilai Siswa</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 bg-white px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                        <Users size={16} /> {quiz.student_results?.length || 0} Siswa Mengerjakan
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs sm:text-sm border-b border-gray-100">
                                <th className="p-3.5 sm:p-4 font-bold pl-4 sm:pl-6">Nama Siswa</th>
                                <th className="p-3.5 sm:p-4 font-bold text-center">Waktu</th>
                                <th className="p-3.5 sm:p-4 font-bold text-center">Benar/Salah</th>
                                <th className="p-3.5 sm:p-4 font-bold text-right pr-4 sm:pr-6">Skor Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quiz.student_results?.map((result, idx) => (
                                <React.Fragment key={idx}>
                                    <tr onClick={() => toggleRow(idx)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group text-xs sm:text-sm">
                                        <td className="p-3.5 sm:p-4 font-bold text-[#1b6d39] pl-4 sm:pl-6 flex items-center gap-2">
                                            {expandedRow === idx ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                            <span className="truncate max-w-[150px] sm:max-w-none">{result.student_name}</span>
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-center font-medium text-gray-500">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Clock size={14} className="text-gray-400"/>
                                                {Math.floor(result.time_spent_seconds / 60)}m {result.time_spent_seconds % 60}s
                                            </div>
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-center font-bold">
                                            <span className="text-green-600">{result.correct_answers}</span>
                                            <span className="text-gray-300 mx-1.5 sm:mx-2">/</span>
                                            <span className="text-red-500">{result.wrong_answers}</span>
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-right pr-4 sm:pr-6">
                                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-black text-xs sm:text-sm shadow-xs ${result.score >= 70 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                                {result.score >= 70 && <Trophy size={14} />} {result.score}
                                            </span>
                                        </td>
                                    </tr>
                                    
                                    {expandedRow === idx && result.answers_data && (
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <td colSpan="4" className="p-4 sm:p-6">
                                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                    <h4 className="font-bold text-gray-800 mb-3 text-xs sm:text-sm uppercase tracking-wider">Analisa Pemahaman: {result.student_name}</h4>
                                                    <div className="space-y-3">
                                                        {JSON.parse(result.answers_data).map((ans, i) => (
                                                            <div key={i} className={`p-3 rounded-lg border flex gap-3 ${ans.is_correct ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                                                <div className="mt-0.5 shrink-0">
                                                                    {ans.is_correct ? <CheckCircle2 size={18} className="text-green-600"/> : <XCircle size={18} className="text-red-500"/>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">{ans.question_text}</p>
                                                                    <p className="text-xs font-medium text-gray-600">
                                                                        Jawaban Siswa: <span className={ans.is_correct ? 'text-green-700 font-bold' : 'text-red-600 font-bold line-through'}>{ans.student_answer}</span>
                                                                    </p>
                                                                    {!ans.is_correct && (
                                                                        <p className="text-xs font-bold text-[#1b6d39] mt-0.5">Kunci: {ans.correct_answer}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {(!quiz.student_results || quiz.student_results.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">Belum ada siswa yang mengerjakan kuis ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}