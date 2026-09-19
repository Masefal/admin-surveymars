import React from 'react';

export default function Login() {
    return (
        <div className="flex min-h-screen bg-[#FDFBF7]">
            <div className="hidden w-1/2 bg-[#1b6d39] p-12 text-white lg:flex lg:flex-col lg:justify-center">
                <div className="mb-8 flex items-center gap-3">
                    <img 
                        src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" 
                        alt="Logo SIT Fithrah Insani" 
                        className="h-12 w-12 rounded-full bg-white p-1 shadow-sm"
                    />
                    <span className="text-xl font-bold tracking-wide">SIT FITHRAH INSANI</span>
                </div>
                <h1 className="mb-4 text-4xl font-bold leading-snug">
                    Membuat kuis jadi lebih mudah untuk orangtua dan menyenangkan untuk anak.
                </h1>
                <p className="text-green-100/90 text-lg">
                    Susun soal dari kisi-kisi, bantu dengan AI, lalu bagikan lewat satu link.
                </p>
            </div>

            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl shadow-gray-200/50">
                    <h2 className="mb-2 text-3xl font-bold text-gray-800">Selamat datang 👋</h2>
                    <p className="mb-8 text-gray-500">Masuk ke Fithrah Quiz untuk mulai membuat quiz.</p>

                    <form className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                            <input 
                                type="email" 
                                placeholder="siti@gmail.com" 
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" 
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39]" 
                            />
                        </div>
                        <div className="text-right">
                            <a href="#" className="text-sm font-semibold text-[#1b6d39] hover:underline">Lupa password?</a>
                        </div>
                        <button 
                            type="button" 
                            className="w-full rounded-lg bg-[#1b6d39] py-3 text-lg font-semibold text-white transition-colors hover:bg-[#14532b] active:bg-[#0e3b1e]"
                        >
                            Masuk
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}