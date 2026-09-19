import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function StudentQuiz() {
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        { id: 'A', text: 'Persegi' },
        { id: 'B', text: 'Persegi panjang' },
        { id: 'C', text: 'Segitiga' },
        { id: 'D', text: 'Lingkaran' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">
                
                <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20">
                    <div className="flex justify-between items-end mb-3">
                        <h1 className="font-bold text-gray-900 truncate pr-4 text-lg">
                            Matematika — Bangun Datar
                        </h1>
                        <span className="text-[#1b6d39] font-bold text-sm whitespace-nowrap">
                            3 / 20
                        </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#1b6d39] h-2 rounded-full w-[15%] transition-all duration-300"></div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                    
                    <div className="flex justify-end mb-6">
                        <div className="bg-orange-50 text-[#F2994A] font-bold px-4 py-1.5 rounded-full text-sm border border-orange-100">
                            29:42
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="text-sm font-semibold text-gray-400 mb-2">
                            Pertanyaan 3
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
                            Perhatikan bangun datar berikut. Bangun yang memiliki empat sisi sama panjang adalah ...
                        </h2>
                    </div>

                    <div className="w-full bg-green-50 rounded-2xl p-6 flex justify-center items-center mb-8 border border-green-100">
                        <div className="w-24 h-24 bg-[#1b6d39] rounded-xl shadow-inner"></div>
                    </div>

                    <div className="space-y-3 mb-8">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedOption(option.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                                    selectedOption === option.id
                                        ? 'border-[#1b6d39] bg-green-50/50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    selectedOption === option.id
                                        ? 'border-[#1b6d39]'
                                        : 'border-gray-300'
                                }`}>
                                    {selectedOption === option.id && (
                                        <div className="h-2.5 w-2.5 bg-[#1b6d39] rounded-full"></div>
                                    )}
                                </div>
                                <span className="font-semibold text-gray-800 text-left">
                                    <span className="mr-1">{option.id}.</span> {option.text}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 flex gap-4">
                        <button className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                            <ArrowLeft size={20} /> Prev
                        </button>
                        <button className="flex-[2] bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                            Next <ArrowRight size={20} />
                        </button>
                    </div>
                </main>

                <footer className="py-5 text-center bg-white">
                    <p className="text-sm font-semibold text-gray-400">
                        Soal 3 dari 20
                    </p>
                </footer>

            </div>
        </div>
    );
}