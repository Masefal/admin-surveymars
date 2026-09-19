import React from 'react';
import AdminLayout from '../Layouts/AdminLayout';
import { ArrowRight } from 'lucide-react';

export default function GenerateQuiz() {
    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Generate Quiz / Pengaturan</div>
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Buat quiz baru</h1>
                    <p className="text-gray-500">Atur dasar quiz sebelum soal dibuat dengan AI.</p>
                </div>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <div className="bg-[#1b6d39] text-white px-6 py-3 rounded-xl font-semibold min-w-max">1 Pengaturan Dasar</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-xl font-semibold min-w-max">2 Kisi-kisi & Soal</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-xl font-semibold min-w-max">3 Generate AI</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-xl font-semibold min-w-max">4 Review</div>
                <div className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-xl font-semibold min-w-max">5 Publikasi</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Quiz</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Nama Quiz</label>
                            <input type="text" defaultValue="Matematika — Bangun Datar" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Kelas</label>
                            <input type="text" defaultValue="Kelas IV A" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Mata Pelajaran</label>
                            <input type="text" defaultValue="Matematika" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi</label>
                            <input type="text" defaultValue="Latihan mengenal dan memahami bangun datar." className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Ringkasan</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Kelas</div>
                            <div className="font-bold text-gray-900">IV A</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Mapel</div>
                            <div className="font-bold text-gray-900">Matematika</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Kisi-kisi</div>
                            <div className="font-bold text-gray-900">Belum dipilih</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Jumlah soal</div>
                            <div className="font-bold text-gray-900">20 soal</div>
                        </div>
                    </div>

                    <button className="w-full bg-[#1b6d39] hover:bg-[#14532b] transition-colors text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                        Lanjutkan <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}