import React from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function StudentLanding() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">

                <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" 
                            alt="Logo Sekolah" 
                            className="h-8 w-8"
                        />
                        <h1 className="font-bold text-gray-900 tracking-tight text-sm">
                            SIT FITHRAH INSANI
                        </h1>
                    </div>
                </header>

                <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                    
                    <div className="bg-[#1b6d39] rounded-2xl p-6 text-white mb-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute -left-4 -bottom-8 w-20 h-20 bg-white opacity-10 rounded-full"></div>
                        
                        <div className="relative z-10">
                            <span className="inline-block bg-[#F2994A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                                Kuis Baru
                            </span>
                            <h2 className="text-2xl font-bold leading-snug">
                                Siap untuk menguji pengetahuanmu?
                            </h2>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
                            Matematika — Bangun Datar
                        </h3>
                        <p className="text-gray-500 font-medium text-sm mb-5">
                            Kelas IV A
                        </p>

                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                <BookOpen size={18} className="text-gray-400" />
                                <span className="text-sm font-bold text-gray-700">20 Soal</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                <Clock size={18} className="text-gray-400" />
                                <span className="text-sm font-bold text-gray-700">30 Menit</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                Nama Lengkap
                            </label>
                            <input 
                                type="text" 
                                placeholder="Masukkan namamu di sini..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#1b6d39] focus:border-transparent transition-all font-medium text-gray-900 placeholder:text-gray-400 outline-none" 
                            />
                        </div>
                        <button className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                            Mulai Mengerjakan <ArrowRight size={20} />
                        </button>
                    </div>
                </main>

                <footer className="py-5 text-center border-t border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-400">
                        © 2026 Fithrah Quiz • Selamat belajar!
                    </p>
                </footer>

            </div>
        </div>
    );
}