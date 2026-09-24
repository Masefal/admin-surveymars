import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatCard from '../Components/StatCard';
import QuizRow from '../Components/QuizRow';
import ActivityItem from '../Components/ActivityItem';

export default function Dashboard() {
    const [stats, setStats] = useState({ total_quiz: 0, active_quiz: 0 });
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        axios.get('/api/dashboard-stats')
            .then(response => {
                setStats({
                    total_quiz: response.data.total_quiz,
                    active_quiz: response.data.active_quiz
                });
                setRecentQuizzes(response.data.recent_quizzes);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    }, []);

    const getStatusStyle = (status) => {
        if (status === 'active') return { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif' };
        if (status === 'finished') return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Selesai' };
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' };
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Beranda / Dashboard</div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Selamat datang, {userName} 👋</h1>
                    <p className="text-sm sm:text-base text-gray-500">Kelola quiz, pantau hasil belajar, dan buat soal lebih cepat.</p>
                </div>
                <Link to="/pengaturan" className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#1b6d39] text-white items-center justify-center font-bold text-xl sm:text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer shrink-0">
                    {initial}
                </Link>
            </div>

            <div className="bg-[#1b6d39] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white mb-6 sm:mb-8 shadow-lg gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Buat quiz baru dalam beberapa langkah</h2>
                    <p className="text-sm sm:text-base text-green-100">Gunakan kisi-kisi dan bantuan AI untuk menyusun soal.</p>
                </div>
                <Link to="/generate" className="w-full sm:w-auto bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0">
                    <Plus size={20} /> Buat Quiz
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <StatCard title="Total Quiz" value={stats.total_quiz} subtitle="Semua kuis dibuat" subtitleColor="text-[#1b6d39]" />
                        <StatCard title="Quiz Aktif" value={stats.active_quiz} subtitle="Kuis sedang berjalan" subtitleColor="text-[#F2994A]" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Quiz terbaru</h3>
                                <Link to="/quizzes" className="text-xs sm:text-sm font-semibold text-[#1b6d39] flex items-center gap-1 hover:underline">
                                    Lihat semua <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="space-y-1">
                                {recentQuizzes.map((quiz) => {
                                    const style = getStatusStyle(quiz.status);
                                    return (
                                        <QuizRow key={quiz.id} id={quiz.id} title={quiz.title} kelas={quiz.student_class?.name || '-'} status={style.label} statusBg={style.bg} statusColor={style.text} peserta={`${quiz.student_results_count || 0} peserta`} />
                                    );
                                })}
                                {recentQuizzes.length === 0 && <div className="text-center py-8 text-gray-500 text-sm font-medium">Belum ada quiz yang dibuat.</div>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Aktivitas terbaru</h3>
                            <div className="space-y-6">
                                <ActivityItem Icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" title="Sistem Siap Digunakan" time="Hari ini" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}