import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Plus, ArrowRight, CheckCircle2, BarChart2, Sparkles, UserCheck, AlertCircle, PlayCircle } from 'lucide-react';
import StatCard from '../Components/StatCard';
import QuizTypeBadge from '../Components/QuizTypeBadge';
import { formatDuration } from '../format';
import QuizRow from '../Components/QuizRow';
import ActivityItem from '../Components/ActivityItem';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_quiz: 0, active_quiz: 0 });
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [linkedStudent, setLinkedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [children, setChildren] = useState([]);
    const [childResults, setChildResults] = useState([]);
    const [parentQuizzes, setParentQuizzes] = useState([]);

    const fetchParentData = async (studentId = null) => {
        const [studentRes, quizRes] = await Promise.all([
            axios.get('/api/parent/linked-student', { params: studentId ? { student_id: studentId } : {} }),
            axios.get('/api/quizzes')
        ]);
        setChildren(studentRes.data?.students || []);
        setLinkedStudent(studentRes.data?.student || null);
        setChildResults(studentRes.data?.results || []);
        setParentQuizzes(Array.isArray(quizRes.data) ? quizRes.data : []);
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Pengguna';
    const initial = userName.charAt(0).toUpperCase();
    const isParent = user?.role === 'orang_tua';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (isParent) {
                    await fetchParentData();
                } else {
                    const response = await axios.get('/api/dashboard-stats');
                    setStats({
                        total_quiz: response.data.total_quiz,
                        active_quiz: response.data.active_quiz
                    });
                    setRecentQuizzes(response.data.recent_quizzes);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [isParent]);

    const getStatusStyle = (status) => {
        if (status === 'active') return { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif' };
        if (status === 'finished') return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Selesai' };
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' };
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b6d39]"></div>
                </div>
            </AdminLayout>
        );
    }

    // ================= DASBOR KHUSUS ORANG TUA =================
    if (isParent) {
        const scores = childResults.map(r => r.score);
        const parentStats = {
            average: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            lowCount: scores.filter(s => s < 70).length,
        };
        // Kuis aktif yang boleh dikerjakan anak ini dan belum pernah dikerjakannya
        const doneQuizIds = new Set(childResults.map(r => r.quiz_id));
        const pendingQuizzes = linkedStudent ? parentQuizzes.filter(q =>
            q.status === 'active'
            && !doneQuizIds.has(q.id)
            && (q.target_student_id ? q.target_student_id === linkedStudent.id : q.student_class_id === linkedStudent.student_class_id)
        ) : [];

        return (
            <AdminLayout>
                <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Beranda / Dasbor Orang Tua</div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Selamat datang, {userName} 👋</h1>
                        <p className="text-sm sm:text-base text-gray-500">Pantau perkembangan belajar dan berikan latihan khusus untuk anak.</p>
                    </div>
                </div>

                {!linkedStudent ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center max-w-xl mx-auto my-6">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Data Anak Belum Terhubung</h2>
                        <p className="text-gray-500 text-sm mb-6">Hubungkan akun Anda dengan NISN anak untuk mulai memantau nilai dan membuat kuis personalisasi.</p>
                        <button 
                            onClick={() => navigate('/pantau-anak')}
                            className="bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm"
                        >
                            Hubungkan Data Anak Sekarang
                        </button>
                    </div>
                ) : (
                    <>
                        {children.length > 1 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {children.map(child => (
                                    <button
                                        key={child.id}
                                        onClick={() => fetchParentData(child.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${child.id === linkedStudent.id ? 'bg-[#1b6d39] border-[#1b6d39] text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {child.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><UserCheck size={22} /></div>
                                <div className="min-w-0">
                                    <div className="font-black text-gray-900 truncate">{linkedStudent.name}</div>
                                    <div className="text-xs font-medium text-gray-500">{linkedStudent.student_class?.name || '-'}</div>
                                </div>
                            </div>
                            <StatCard title="Rata-rata Nilai" value={parentStats.average} subtitle={parentStats.average >= 75 ? 'Sudah baik' : 'Perlu latihan'} subtitleColor={parentStats.average >= 75 ? 'text-[#1b6d39]' : 'text-[#F2994A]'} />
                            <StatCard title="Kuis Dikerjakan" value={childResults.length} subtitle="Total pengerjaan" subtitleColor="text-[#1b6d39]" />
                            <StatCard title="Belum Dikerjakan" value={pendingQuizzes.length} subtitle="Kuis aktif untuk anak" subtitleColor="text-[#F2994A]" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Kuis yang belum dikerjakan</h3>
                                <p className="text-xs text-gray-500 mb-4">Buka link-nya di perangkat anak. Anak akan diminta memilih nama dan mengisi NISN.</p>
                                <div className="space-y-3">
                                    {pendingQuizzes.map(quiz => (
                                        <div key={quiz.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                                                    <QuizTypeBadge quiz={quiz} />
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase">{quiz.subject?.name}</span>
                                                </div>
                                                <div className="font-bold text-gray-900 text-sm truncate">{quiz.title}</div>
                                            </div>
                                            <a href={`/q/${quiz.share_code}`} target="_blank" rel="noreferrer" className="shrink-0 bg-[#1b6d39] hover:bg-[#14532b] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                                                <PlayCircle size={14} /> Kerjakan
                                            </a>
                                        </div>
                                    ))}
                                    {pendingQuizzes.length === 0 && <div className="text-center py-6 text-gray-400 text-sm font-medium">Semua kuis aktif sudah dikerjakan.</div>}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Nilai terbaru</h3>
                                    <Link to="/pantau-anak" className="text-xs sm:text-sm font-semibold text-[#1b6d39] flex items-center gap-1 hover:underline">
                                        Lihat semua <ArrowRight size={16} />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {childResults.slice(0, 5).map(result => (
                                        <div key={result.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100">
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 text-sm truncate">{result.quiz?.title || 'Kuis'}</div>
                                                <div className="text-xs text-gray-400">
                                                    {result.quiz?.subject?.name || 'Umum'} · {new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {formatDuration(result.time_spent_seconds)}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-3 py-1 rounded-full font-black text-sm ${result.score >= 70 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{result.score}</span>
                                        </div>
                                    ))}
                                    {childResults.length === 0 && <div className="text-center py-6 text-gray-400 text-sm font-medium">Belum ada kuis yang dikerjakan.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1b6d39] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white shadow-lg gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-1">Buat Kuis Latihan Personalisasi</h2>
                                <p className="text-sm sm:text-base text-green-100">
                                    {parentStats.lowCount > 0
                                        ? `${linkedStudent.name} punya ${parentStats.lowCount} nilai di bawah 70. Buat latihan dari soal yang dijawab salah.`
                                        : 'Bantu tingkatkan pemahaman materi anak dengan soal latihan khusus dari AI.'}
                                </p>
                            </div>
                            <Link to="/generate" className="w-full sm:w-auto bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0">
                                <Sparkles size={20} /> Buat Kuis AI
                            </Link>
                        </div>
                    </>
                )}
            </AdminLayout>
        );
    }

    // ================= DASBOR GURU (DEFAULT) =================
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
        </AdminLayout>
    );
}