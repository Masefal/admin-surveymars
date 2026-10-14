import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowLeft, Users, Clock, Trophy, ChevronDown, ChevronUp, CheckCircle2, XCircle, Send, BarChart3, Target, AlertTriangle, ListChecks, Edit, Trash2, Plus, X } from 'lucide-react';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeTab, setActiveTab] = useState('analitik');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [formData, setFormData] = useState({
        id: null,
        question_text: '',
        options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
        ]
    });

    const fetchDetail = () => {
        axios.get(`/api/quizzes/${id}`)
            .then(response => { setQuiz(response.data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const toggleRow = (idx) => setExpandedRow(expandedRow === idx ? null : idx);

    const handleDeleteQuestion = async (questionId) => {
        if (!confirm('Yakin ingin menghapus soal ini?')) return;
        try {
            await axios.delete(`/api/questions/${questionId}`);
            fetchDetail();
        } catch (error) {
            alert('Gagal menghapus soal.');
        }
    };

    const openAddModal = () => {
        setFormMode('add');
        setFormData({
            id: null,
            question_text: '',
            options: [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false }
            ]
        });
        setIsModalOpen(true);
    };

    const openEditModal = (question) => {
        setFormMode('edit');
        setFormData({
            id: question.id,
            question_text: question.question_text,
            options: question.options.map(opt => ({ option_text: opt.option_text, is_correct: opt.is_correct }))
        });
        setIsModalOpen(true);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index].option_text = value;
        setFormData({ ...formData, options: newOptions });
    };

    const setCorrectOption = (index) => {
        const newOptions = formData.options.map((opt, i) => ({
            ...opt,
            is_correct: i === index
        }));
        setFormData({ ...formData, options: newOptions });
    };

    const saveQuestion = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (formMode === 'add') {
                await axios.post(`/api/quizzes/${id}/questions`, formData);
            } else {
                await axios.put(`/api/questions/${formData.id}`, formData);
            }
            setIsModalOpen(false);
            fetchDetail();
        } catch (error) {
            alert('Gagal menyimpan soal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div></div></AdminLayout>;
    if (!quiz) return <AdminLayout><div className="p-10 text-center text-gray-500 font-bold">Kuis tidak ditemukan.</div></AdminLayout>;

    const results = quiz.student_results || [];
    
    // PERBAIKAN GRAFIK: Hanya ambil nilai terakhir untuk setiap siswa unik
    const uniqueStudentsMap = new Map();
    results.forEach(r => {
        if (!uniqueStudentsMap.has(r.student_name)) {
            uniqueStudentsMap.set(r.student_name, r);
        }
    });
    const latestUniqueResults = Array.from(uniqueStudentsMap.values());

    const averageScore = latestUniqueResults.length > 0 ? Math.round(latestUniqueResults.reduce((acc, curr) => acc + curr.score, 0) / latestUniqueResults.length) : 0;
    const strugglingStudents = latestUniqueResults.filter(r => r.score < 70);
    const questions = quiz.questions || [];

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
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-green-700/50 pt-4 md:border-0 md:pt-0">
                    {/* PERBAIKAN TOMBOL: Hanya muncul jika ada siswa yang remedial */}
                    {strugglingStudents.length > 0 && (
                        <button 
                            onClick={() => navigate('/generate', { state: { remedialTarget: strugglingStudents } })}
                            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shrink-0 text-sm sm:text-base"
                        >
                            <Target size={18} /> Generate Remedial AI
                        </button>
                    )}
                    <button 
                        onClick={() => navigate('/dibagikan', { state: { quiz: quiz } })}
                        className="w-full sm:w-auto bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shrink-0 text-sm sm:text-base"
                    >
                        <Send size={18} /> Bagikan
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('analitik')} 
                    className={`px-5 py-3 font-bold text-sm sm:text-base whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'analitik' ? 'border-[#1b6d39] text-[#1b6d39]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <BarChart3 size={18} /> Analitik Siswa
                </button>
                <button 
                    onClick={() => setActiveTab('soal')} 
                    className={`px-5 py-3 font-bold text-sm sm:text-base whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${activeTab === 'soal' ? 'border-[#1b6d39] text-[#1b6d39]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <ListChecks size={18} /> Daftar Soal ({questions.length})
                </button>
            </div>

            {activeTab === 'analitik' && (
                <div className="animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Users size={24} /></div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{latestUniqueResults.length}</div>
                                <div className="text-sm text-gray-500 font-medium">Total Siswa</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><BarChart3 size={24} /></div>
                            <div>
                                <div className="text-2xl font-black text-gray-900">{averageScore}</div>
                                <div className="text-sm text-gray-500 font-medium">Rata-rata Kelas</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={24} /></div>
                            <div>
                                <div className="text-2xl font-black text-red-600">{strugglingStudents.length}</div>
                                <div className="text-sm text-red-400 font-medium">Butuh Remedial AI</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Grafik Tingkat Pemahaman Siswa (Nilai Terakhir)</h3>
                        {latestUniqueResults.length === 0 ? (
                            <div className="text-center text-gray-400 py-10 font-medium text-sm">Belum ada data partisipasi siswa.</div>
                        ) : (
                            <div className="space-y-5">
                                {latestUniqueResults.map((res, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="w-full sm:w-48 text-sm font-semibold text-gray-700 truncate">
                                            {res.student_name}
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-full bg-gray-100 rounded-full h-3.5 flex overflow-hidden">
                                                <div className={`h-full ${res.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${res.score}%` }}></div>
                                            </div>
                                            <span className={`text-sm font-bold w-12 text-right ${res.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{res.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-3">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Riwayat Pengerjaan Detail</h3>
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
                                    {results.map((result, idx) => (
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
                                                    <span className="text-green-600">{result.correct_answers}</span><span className="text-gray-300 mx-1.5">/</span><span className="text-red-500">{result.wrong_answers}</span>
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
                                                            <div className="space-y-3">
                                                                {JSON.parse(result.answers_data).map((ans, i) => (
                                                                    <div key={i} className={`p-3 rounded-lg border flex gap-3 ${ans.is_correct ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                                                        <div className="mt-0.5 shrink-0">{ans.is_correct ? <CheckCircle2 size={18} className="text-green-600"/> : <XCircle size={18} className="text-red-500"/>}</div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">{ans.question_text}</p>
                                                                            <p className="text-xs font-medium text-gray-600">Jawaban Siswa: <span className={ans.is_correct ? 'text-green-700 font-bold' : 'text-red-600 font-bold line-through'}>{ans.student_answer}</span></p>
                                                                            {!ans.is_correct && <p className="text-xs font-bold text-[#1b6d39] mt-0.5">Kunci: {ans.correct_answer}</p>}
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
                                    {results.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">Belum ada siswa yang mengerjakan kuis ini.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'soal' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex justify-end mb-4">
                        <button onClick={openAddModal} className="bg-[#1b6d39] hover:bg-[#14532b] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-sm">
                            <Plus size={18} /> Tambah Soal Manual
                        </button>
                    </div>
                    
                    {questions.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 shadow-sm">Belum ada soal di kuis ini.</div>
                    ) : (
                        <div className="space-y-4 mb-10">
                            {questions.map((q, i) => (
                                <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 relative group hover:border-[#1b6d39]/50 transition-colors">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(q)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit Soal"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Hapus Soal"><Trash2 size={16} /></button>
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 pr-20">{i + 1}. {q.question_text}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {q.options?.map((opt, oIdx) => (
                                            <div key={opt.id} className={`p-3 rounded-xl border-2 flex items-center gap-3 ${opt.is_correct ? 'bg-green-50/50 border-[#1b6d39]' : 'bg-gray-50 border-transparent'}`}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${opt.is_correct ? 'border-[#1b6d39]' : 'border-gray-300'}`}>
                                                    {opt.is_correct && <div className="w-2.5 h-2.5 bg-[#1b6d39] rounded-full"></div>}
                                                </div>
                                                <span className={`text-sm font-medium ${opt.is_correct ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{String.fromCharCode(65 + oIdx)}. {opt.option_text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        
                        <div className="p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">{formMode === 'add' ? 'Tambah Soal Baru' : 'Edit Soal'}</h2>
                            
                            <form onSubmit={saveQuestion} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Pertanyaan</label>
                                    <textarea 
                                        required
                                        rows="3"
                                        value={formData.question_text}
                                        onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#1b6d39] outline-none text-gray-800 transition-colors resize-none"
                                        placeholder="Tulis soal di sini..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Pilihan Jawaban (Tandai yang benar)</label>
                                    <div className="space-y-3">
                                        {formData.options.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${opt.is_correct ? 'border-[#1b6d39] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                                                <button 
                                                    type="button"
                                                    onClick={() => setCorrectOption(idx)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${opt.is_correct ? 'border-[#1b6d39]' : 'border-gray-300'}`}
                                                >
                                                    {opt.is_correct && <div className="w-3 h-3 bg-[#1b6d39] rounded-full"></div>}
                                                </button>
                                                <span className="font-bold text-gray-400 w-5">{String.fromCharCode(65 + idx)}.</span>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={opt.option_text}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                                                    className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1b6d39] hover:bg-[#14532b] transition-colors disabled:opacity-50">
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Soal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}