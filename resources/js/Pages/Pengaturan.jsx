import React, { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { User, Lock, CheckCircle2 } from 'lucide-react';

export default function Pengaturan() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initial = (user.name || 'Admin').charAt(0).toUpperCase();

    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        current_password: '',
        new_password: ''
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post('/api/profile/update', formData);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            alert('Profil berhasil diperbarui!');
            window.location.reload(); 
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Beranda / Profil & Pengaturan</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">Pengaturan Akun</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[#1b6d39] text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-md shrink-0">{initial}</div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">{user.email}</p>
                        <span className="mt-2 inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">Admin Aktif</span>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <User className="text-gray-400 shrink-0" size={22} />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm sm:text-base">Edit Profil & Email</div>
                                    <div className="text-xs sm:text-sm text-gray-500">Ubah informasi akun dasar</div>
                                </div>
                            </div>
                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-[#1b6d39] font-bold text-xs sm:text-sm hover:underline">
                                {isEditingProfile ? 'Tutup' : 'Ubah'}
                            </button>
                        </div>
                        {isEditingProfile && (
                            <div className="mt-4 space-y-3 pt-3 border-t border-gray-200/60">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Nama Lengkap</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#1b6d39] text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Alamat Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#1b6d39] text-sm mt-1" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Lock className="text-gray-400 shrink-0" size={22} />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm sm:text-base">Ubah Password</div>
                                    <div className="text-xs sm:text-sm text-gray-500">Perbarui kata sandi akun</div>
                                </div>
                            </div>
                            <button onClick={() => setIsEditingPassword(!isEditingPassword)} className="text-[#1b6d39] font-bold text-xs sm:text-sm hover:underline">
                                {isEditingPassword ? 'Tutup' : 'Ubah'}
                            </button>
                        </div>
                        {isEditingPassword && (
                            <div className="mt-4 space-y-3 pt-3 border-t border-gray-200/60">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Password Lama</label>
                                    <input type="password" placeholder="Masukkan password lama..." value={formData.current_password} onChange={(e) => setFormData({...formData, current_password: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#1b6d39] text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Password Baru</label>
                                    <input type="password" placeholder="Minimal 6 karakter" value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#1b6d39] text-sm mt-1" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {(isEditingProfile || isEditingPassword) && (
                    <div className="mt-6 sm:mt-8 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-[#1b6d39] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#14532b] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 text-sm shadow-sm">
                            <CheckCircle2 size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}