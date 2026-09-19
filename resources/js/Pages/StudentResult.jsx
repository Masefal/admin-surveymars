import React from 'react';
import { Trophy, CheckCircle2, XCircle, Clock, Home } from 'lucide-react';

export default function StudentResult() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">
                
                <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <h1 className="font-bold text-gray-900 tracking-tight text-sm uppercase">
                        Hasil Kuis
                    </h1>
                </header>

                <main className="flex-1 flex flex-col p-6 overflow-y-auto items-center justify-center">
                    
                    <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-green-100">
                        <Trophy size={44} className="text-[#1b6d39]" />
                    </div>

                    <h2 className="text-4xl font-black text-gray-900 mb-2">Nilai: 85</h2>
                    <p className="text-gray-500 font-medium mb-10 text-center text-sm px-4">
                        Kerja bagus, Ahmad Fauzan!<br/>Kamu telah menyelesaikan kuis ini.
                    </p>

                    <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
                        <h3 className="font-bold text-gray-900 mb-5 text-center border-b border-gray-100 pb-4 text-sm">
                            Matematika — Bangun Datar
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-green-600 mb-1.5">
                                    <CheckCircle2 size={16} strokeWidth={2.5} />
                                    <span className="font-bold text-xs uppercase tracking-wider">Benar</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">17</span>
                            </div>
                            
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center gap-1.5 text-red-500 mb-1.5">
                                    <XCircle size={16} strokeWidth={2.5} />
                                    <span className="font-bold text-xs uppercase tracking-wider">Salah</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">3</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-orange-500 mb-1.5">
                                    <Clock size={16} strokeWidth={2.5} />
                                    <span className="font-bold text-xs uppercase tracking-wider">Waktu</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">12m</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto w-full pt-6 border-t border-gray-50">
                        <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                            <Home size={20} /> Kembali ke Awal
                        </button>
                    </div>

                </main>

            </div>
        </div>
    );
}