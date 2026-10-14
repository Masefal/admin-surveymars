import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { Trash2, Power, Search, Clock, Users, PlayCircle, Plus } from 'lucide-react';

export default function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get(`/api/quizzes?search=${search}`);
            setQuizzes(response.data);
        } catch (error) {
            console.error("Gagal mengambil data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchQuizzes();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const toggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'menutup' : 'mengaktifkan kembali';
        if (!confirm(`Yakin ingin ${action} kuis ini?`)) return;
        
        try {
            await axios.put(`/api/quizzes/${id}/status`);
            fetchQuizzes();
        } catch (error) {
            alert("Gagal merubah status kuis.");
        }
    };

    const deleteQuiz = async (id) => {
        if (!confirm('AWAS: Yakin ingin menghapus kuis ini permanen? SEMUA soal dan nilai siswa terkait kuis ini akan hilang!')) return;
        
        try {
            await axios.delete(`/api/quizzes/${id}`);
            fetchQuizzes();
        } catch (error) {
            alert("Gagal menghapus kuis.");
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Manajemen Kuis / Daftar Kuis</div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Bank Soal & Kuis</h1>
                    <p className="text-sm text-gray-500">Kelola semua kuis yang telah Anda buat atau generate dengan AI.</p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kuis..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-[#1b6d39] focus:border-[#1b6d39] text-sm outline-none"
                        />
                    </div>
                    <Link to="/generate" className="bg-[#1b6d39] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#14532b] transition-colors shrink-0 text-sm">
                        <Plus size={18} /> Buat Kuis
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                    <div className="text-gray-400 mb-3 flex justify-center"><Search size={40} /></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Kuis tidak ditemukan</h3>
                    <p className="text-gray-500 text-sm">Belum ada kuis yang dibuat atau kriteria pencarian tidak cocok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                        {quiz.subject?.name || 'UMUM'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                        quiz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {quiz.status === 'active' ? 'Aktif' : 'Selesai'}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-gray-900 text-lg mb-1 leading-tight">{quiz.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description || 'Tidak ada deskripsi'}</p>
                                
                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 mb-4">
                                    <div className="flex items-center gap-1.5"><Users size={14} className="text-gray-400"/> {quiz.student_class?.name || '-'}</div>
                                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {quiz.time_limit_minutes} Menit</div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100">
                                    <span className="text-xs text-gray-500 font-medium">Kode Akses:</span>
                                    <span className="font-mono font-bold text-[#1b6d39] tracking-widest">{quiz.share_code}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50 divide-x divide-gray-100">
                                <Link to={`/quiz/${quiz.id}`} className="flex flex-col items-center justify-center p-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors gap-1">
                                    <PlayCircle size={18} />
                                    <span className="text-[10px] font-bold uppercase">Detail</span>
                                </Link>
                                <button onClick={() => toggleStatus(quiz.id, quiz.status)} className={`flex flex-col items-center justify-center p-3 transition-colors gap-1 ${quiz.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                                    <Power size={18} />
                                    <span className="text-[10px] font-bold uppercase">{quiz.status === 'active' ? 'Tutup' : 'Buka'}</span>
                                </button>
                                <button onClick={() => deleteQuiz(quiz.id)} className="flex flex-col items-center justify-center p-3 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors gap-1">
                                    <Trash2 size={18} />
                                    <span className="text-[10px] font-bold uppercase">Hapus</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}