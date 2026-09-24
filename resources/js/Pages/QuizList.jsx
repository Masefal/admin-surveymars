import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Search, Plus, Loader2 } from 'lucide-react';
import QuizRow from '../Components/QuizRow';

export default function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = (search = '') => {
        setLoading(true);
        axios.get(`/api/quizzes?search=${search}`)
            .then(response => {
                setQuizzes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Gagal mengambil data kuis:", error);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchQuizzes(searchTerm);
    };

    const getStatusStyle = (status) => {
        if (status === 'active') return { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif' };
        if (status === 'finished') return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Selesai' };
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' };
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        if (filterStatus === 'Aktif') return quiz.status === 'active';
        if (filterStatus === 'Selesai') return quiz.status === 'finished';
        return true;
    });

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Beranda / Bank Soal</div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Daftar Kuis</h1>
                    <p className="text-sm sm:text-base text-gray-500">Kelola semua kuis yang telah Anda buat.</p>
                </div>
                <Link to="/generate" className="w-full sm:w-auto bg-[#1b6d39] hover:bg-[#14532b] transition-colors text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm shrink-0">
                    <Plus size={20} /> Buat Kuis Baru
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm min-h-[60vh]">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {['Semua', 'Aktif', 'Selesai'].map(tab => (
                            <button 
                                key={tab} 
                                type="button"
                                onClick={() => setFilterStatus(tab)}
                                className={`px-4 py-2 font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shrink-0 ${
                                    filterStatus === tab ? 'bg-[#1b6d39] text-white shadow-xs' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-72">
                        <input 
                            type="text" 
                            placeholder="Cari nama kuis..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:border-[#1b6d39] focus:ring-1 focus:ring-[#1b6d39] outline-none transition-all text-xs sm:text-sm font-medium"
                        />
                        <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
                        <button type="submit" className="hidden"></button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#1b6d39]" size={40} />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredQuizzes.length > 0 ? (
                            filteredQuizzes.map((quiz) => {
                                const style = getStatusStyle(quiz.status);
                                return (
                                    <QuizRow 
                                        key={quiz.id}
                                        id={quiz.id}
                                        title={quiz.title} 
                                        kelas={quiz.student_class?.name || '-'} 
                                        status={style.label} 
                                        statusBg={style.bg} 
                                        statusColor={style.text} 
                                        peserta={`${quiz.student_results_count || 0} peserta`} 
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Kuis tidak ditemukan</h3>
                                <p className="text-gray-500 text-sm">Belum ada kuis yang dibuat atau kriteria pencarian tidak cocok.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}