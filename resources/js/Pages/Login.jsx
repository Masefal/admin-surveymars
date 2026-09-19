import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-10 w-10"/>
                        <h2 className="font-bold text-2xl text-gray-900">Quiz AI</h2>
                    </div>
                    
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Selamat Datang</h1>
                    <p className="text-gray-500 mb-8">Masuk untuk mengelola kuis dan melihat hasil siswa SIT Fithrah Insani.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                            <input 
                                type="email" 
                                required 
                                defaultValue="guru@fithrahinsani.org" 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] focus:ring-2 focus:ring-[#1b6d39] focus:border-transparent outline-none transition-all font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                            <input 
                                type="password" 
                                required 
                                defaultValue="password" 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#1b6d39] focus:ring-2 focus:ring-[#1b6d39] focus:border-transparent outline-none transition-all font-medium" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:bg-gray-400"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Masuk ke Dashboard <ArrowRight size={20} /></>}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="hidden lg:block relative w-0 flex-1 bg-[#1b6d39] overflow-hidden">
                <div className="absolute inset-0 h-full w-full flex flex-col justify-center items-center text-white p-20 relative z-10">
                    <BookOpen size={80} className="mb-8 text-green-200" />
                    <h2 className="text-4xl font-black mb-4 text-center leading-tight">Buat soal lebih cepat,<br/>evaluasi lebih mudah.</h2>
                    <p className="text-xl text-green-100/80 text-center font-medium max-w-lg">Platform pembuatan kuis otomatis berteknologi AI (Gemini) khusus untuk pendidik SIT Fithrah Insani.</p>
                </div>
                
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}