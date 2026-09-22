import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowRight, Loader2, UserPlus } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isRegister ? '/api/register' : '/api/login';
            const response = await axios.post(url, formData);

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Email atau Password salah!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-10 w-10" />
                        <h2 className="font-bold text-2xl text-gray-900">Quiz AI</h2>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        {isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {isRegister ? 'Daftar sebagai Admin/Guru untuk membuat kuis.' : 'Masuk untuk mengelola kuis dan melihat hasil siswa.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Nama Lengkap</label>
                                <input type="text" name="name" required placeholder="Misal: Bu Siti" onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] outline-none" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                            <input type="email" name="email" required placeholder="walimurid@gmail.com" onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                            <input type="password" name="password" required placeholder="Minimal 6 karakter" onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] outline-none" />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegister ? <><UserPlus size={20} /> Daftar Sekarang</> : <>Masuk ke Dashboard <ArrowRight size={20} /></>)}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-[#1b6d39] hover:underline">
                            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar sekarang'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative w-0 flex-1 bg-[#1b6d39] overflow-hidden">
                <div className="absolute inset-0 h-full w-full flex flex-col justify-center items-center text-white p-20 relative z-10">
                    <BookOpen size={80} className="mb-8 text-green-200" />
                    <h2 className="text-4xl font-black mb-4 text-center leading-tight">Buat soal lebih cepat,<br />evaluasi lebih mudah.</h2>
                    <p className="text-xl text-green-100/80 text-center font-medium max-w-lg">Platform pembuatan kuis otomatis berteknologi AI.</p>
                </div>
            </div>
        </div>
    );
}