import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { MessageCircle, QrCode, Link as LinkIcon } from 'lucide-react';

export default function QuizDibagikan() {
    const location = useLocation();
    const { quiz } = location.state || {};
    
    const shareUrl = quiz ? `quiz.fithrahinsani.org/q/${quiz.share_code}` : 'quiz.fithrahinsani.org/q/UNKNOWN';

    return (
        <AdminLayout>
            <div className="mb-2 text-sm font-medium text-gray-400">Quiz Dibagikan / {quiz?.subject?.name || '-'}</div>

            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Quiz Dibagikan</h1>
                <button className="h-14 w-14 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer">
                    S
                </button>
            </div>

            <div className="bg-[#1b6d39] rounded-3xl p-10 text-white mb-20 shadow-xl relative mt-4">
                <div className="absolute top-8 right-8 z-10">
                    <span className="bg-white text-[#1b6d39] font-black px-5 py-2 rounded-full text-sm shadow-md tracking-wide">
                        AKTIF
                    </span>
                </div>

                <div className="w-full max-w-2xl relative z-10">
                    <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        Quiz siap dibagikan! 🎉
                    </h2>
                    <h3 className="text-2xl font-semibold mb-2 text-green-50">{quiz?.subject?.name || '-'} — {quiz?.title || '-'}</h3>
                    <p className="text-green-200/90 text-base mb-8 font-medium">{quiz?.student_class?.name || '-'} • {quiz?.time_limit_minutes || 30} menit</p>

                    <div className="flex items-center bg-[#14532b] p-2.5 rounded-2xl border border-[#238b49] shadow-inner max-w-lg">
                        <div className="px-4 text-green-100 flex-1 truncate font-medium tracking-wide">
                            {shareUrl}
                        </div>
                        <button className="bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md">
                            Salin
                        </button>
                    </div>
                </div>
                
                <div className="absolute -bottom-12 right-12 z-20">
                    <div className="h-44 w-44 bg-white rounded-2xl shadow-2xl p-2">
                        <div className="w-full h-full bg-gray-200 rounded-xl overflow-hidden relative">
                            <img 
                                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop" 
                                alt="Foto Kelas" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 px-2">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bagikan link ke siswa</h3>
                <p className="text-gray-500 font-medium text-sm">Siswa tidak perlu membuat akun. Cukup buka link, isi nama, lalu mulai mengerjakan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group">
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <MessageCircle size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-lg">WhatsApp</div>
                        <div className="text-sm text-gray-500 font-medium">Bagikan ke grup kelas</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                    <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center text-[#F2994A] group-hover:scale-110 transition-transform">
                        <QrCode size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-lg">QR Code</div>
                        <div className="text-sm text-gray-500 font-medium">Tampilkan di kelas</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <LinkIcon size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-lg">Salin Link</div>
                        <div className="text-sm text-gray-500 font-medium">Tempel di LMS / chat</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}