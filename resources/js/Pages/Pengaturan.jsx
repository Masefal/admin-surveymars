import React from 'react';
import AdminLayout from '../Layouts/AdminLayout';
import { User, Lock, CheckCircle2 } from 'lucide-react';

export default function Pengaturan() {
    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Beranda / Profil & Pengaturan</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan Akun</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm max-w-2xl">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="h-24 w-24 rounded-full bg-[#1b6d39] text-white flex items-center justify-center font-bold text-4xl shadow-md">S</div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Bu Siti</h2>
                        <p className="text-gray-500 font-medium">guru@fithrahinsani.org</p>
                        <span className="mt-2 inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Admin Aktif</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <User className="text-gray-400" />
                            <div>
                                <div className="font-bold text-gray-900">Edit Profil</div>
                                <div className="text-sm text-gray-500">Ubah nama dan informasi dasar</div>
                            </div>
                        </div>
                        <button className="text-[#1b6d39] font-bold text-sm">Ubah</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <Lock className="text-gray-400" />
                            <div>
                                <div className="font-bold text-gray-900">Password</div>
                                <div className="text-sm text-gray-500">Perbarui kata sandi akun</div>
                            </div>
                        </div>
                        <button className="text-[#1b6d39] font-bold text-sm">Ubah</button>
                    </div>
                </div>
                
                <div className="mt-8 text-right">
                    <button className="bg-[#1b6d39] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#14532b] transition-colors flex items-center justify-end gap-2 ml-auto">
                        <CheckCircle2 size={18} /> Simpan Perubahan
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}