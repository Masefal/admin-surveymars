import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { Plus, ArrowRight, CheckCircle2, UserPlus, ArrowUpRight, FileText } from 'lucide-react';
import StatCard from '../Components/StatCard';
import QuizRow from '../Components/QuizRow';
import ActivityItem from '../Components/ActivityItem';

export default function Dashboard() {
    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Beranda / Dashboard</div>
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Selamat datang, Bu Siti 👋</h1>
                    <p className="text-gray-500">Kelola quiz, pantau hasil belajar, dan buat soal lebih cepat.</p>
                </div>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="bg-[#1b6d39] rounded-2xl p-8 flex justify-between items-center text-white mb-8 shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Buat quiz baru dalam beberapa langkah</h2>
                    <p className="text-green-100">Gunakan kisi-kisi dan bantuan AI untuk menyusun soal.</p>
                </div>
                <Link to="/generate" className="bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Buat Quiz
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Quiz" 
                    value="24" 
                    subtitle="↑ 12% bulan ini" 
                    subtitleColor="text-[#1b6d39]" 
                />
                <StatCard 
                    title="Quiz Aktif" 
                    value="8" 
                    subtitle="3 akan berakhir minggu ini" 
                    subtitleColor="text-[#F2994A]" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Quiz terbaru</h3>
                        <a href="#" className="text-sm font-semibold text-[#1b6d39] flex items-center gap-1 hover:underline">
                            Lihat semua <ArrowRight size={16} />
                        </a>
                    </div>

                    <div className="space-y-1">
                        <QuizRow 
                            title="Matematika — Bangun Datar" 
                            kelas="IV A" 
                            status="Aktif" 
                            statusBg="bg-green-50" 
                            statusColor="text-green-700" 
                            peserta="24 peserta" 
                        />
                        <QuizRow 
                            title="PAI — Akhlak Terpuji" 
                            kelas="IV B" 
                            status="Selesai" 
                            statusBg="bg-orange-50" 
                            statusColor="text-orange-600" 
                            peserta="31 peserta" 
                        />
                        <QuizRow 
                            title="Bahasa Indonesia — Ide Pokok" 
                            kelas="V A" 
                            status="Aktif" 
                            statusBg="bg-green-50" 
                            statusColor="text-green-700" 
                            peserta="18 peserta" 
                        />
                        <QuizRow 
                            title="IPA — Sistem Pernapasan" 
                            kelas="VI A" 
                            status="Draft" 
                            statusBg="bg-gray-100" 
                            statusColor="text-gray-600" 
                            peserta="—" 
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Aktivitas terbaru</h3>
                    
                    <div className="space-y-6">
                        <ActivityItem 
                            Icon={CheckCircle2} 
                            iconBg="bg-green-50" 
                            iconColor="text-green-600" 
                            title="Quiz PAI selesai" 
                            time="2 menit lalu" 
                        />
                        <ActivityItem 
                            Icon={UserPlus} 
                            iconBg="bg-orange-50" 
                            iconColor="text-orange-500" 
                            title="5 siswa baru mengerjakan" 
                            time="18 menit lalu" 
                        />
                        <ActivityItem 
                            Icon={ArrowUpRight} 
                            iconBg="bg-green-50" 
                            iconColor="text-green-600" 
                            title="Quiz Matematika dibagikan" 
                            time="1 jam lalu" 
                        />
                        <ActivityItem 
                            Icon={FileText} 
                            iconBg="bg-gray-50" 
                            iconColor="text-gray-400" 
                            title="Kisi-kisi baru dibuat" 
                            time="Kemarin" 
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}