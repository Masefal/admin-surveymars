import React from 'react';
import AdminLayout from '../Layouts/AdminLayout';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ReviewSoal() {
    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Generate Quiz / Review</div>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Review hasil generate AI</h1>
                    <p className="text-gray-500">Periksa dan edit soal sebelum quiz dipublikasikan.</p>
                </div>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-full">20 soal</span>
                    <span className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-semibold text-sm rounded-full">15 Pilihan Ganda</span>
                    <span className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-semibold text-sm rounded-full">5 Benar / Salah</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-semibold text-sm rounded-xl">
                    <Sparkles size={16} />
                    AI membantu, orangtua tetap menentukan.
                </div>
            </div>

            <div className="space-y-6 mb-24">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-bold text-gray-400 tracking-wider">SOAL 1</div>
                        <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Pilihan Ganda</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Perhatikan bangun datar berikut. Bangun yang memiliki empat sisi sama panjang adalah ...</h3>
                    <div className="flex gap-6 text-gray-600 mb-6">
                        <span>A. Persegi</span>
                        <span>B. Persegi panjang</span>
                        <span>C. Segitiga</span>
                        <span>D. Lingkaran</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-[#1b6d39]">Jawaban: A. Persegi</div>
                        <div className="flex gap-4 text-sm font-semibold">
                            <button className="text-[#1b6d39] hover:underline">Edit</button>
                            <button className="text-red-500 hover:underline">Hapus</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-bold text-gray-400 tracking-wider">SOAL 2</div>
                        <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Pilihan Ganda</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Keliling persegi dengan panjang sisi 8 cm adalah ...</h3>
                    <div className="flex gap-6 text-gray-600 mb-6">
                        <span>A. 16 cm</span>
                        <span>B. 24 cm</span>
                        <span>C. 32 cm</span>
                        <span>D. 64 cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-[#1b6d39]">Jawaban: C. 32 cm</div>
                        <div className="flex gap-4 text-sm font-semibold">
                            <button className="text-[#1b6d39] hover:underline">Edit</button>
                            <button className="text-red-500 hover:underline">Hapus</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-bold text-gray-400 tracking-wider">SOAL 3</div>
                        <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Pilihan Ganda</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Manakah yang termasuk bangun datar yang memiliki 3 sisi?</h3>
                    <div className="flex gap-6 text-gray-600 mb-6">
                        <span>A. Persegi</span>
                        <span>B. Segitiga</span>
                        <span>C. Lingkaran</span>
                        <span>D. Trapesium</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-[#1b6d39]">Jawaban: B. Segitiga</div>
                        <div className="flex gap-4 text-sm font-semibold">
                            <button className="text-[#1b6d39] hover:underline">Edit</button>
                            <button className="text-red-500 hover:underline">Hapus</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 p-4 px-8 flex justify-between items-center z-10">
                <div className="text-gray-500 font-medium">20 soal siap direview</div>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        Preview
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-[#1b6d39] text-white font-bold hover:bg-[#14532b] transition-colors flex items-center gap-2">
                        Publikasikan <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}