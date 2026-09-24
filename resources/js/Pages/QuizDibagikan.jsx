import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { MessageCircle, QrCode, Link as LinkIcon, Check } from 'lucide-react';

export default function QuizDibagikan() {
    const location = useLocation();
    const { quiz } = location.state || {};
    const [copied, setCopied] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    const shareUrl = quiz ? `${window.location.origin}/q/${quiz.share_code}` : `${window.location.origin}/q/UNKNOWN`;

    const getSubjectImage = (mapel) => {
        const m = mapel?.toLowerCase() || ''
        if (m.includes('matematika') || m.includes('mtk')) return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400&auto=format&fit=crop';
        if (m.includes('alam') || m.includes('ipa') || m.includes('sains')) return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop';
        if (m.includes('sosial') || m.includes('ips') || m.includes('sejarah')) return 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop';
        if (m.includes('pancasila') || m.includes('pkn') || m.includes('kewarganegaraan')) return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=400&auto=format&fit=crop';
        if (m.includes('bahasa') || m.includes('inggris') || m.includes('indonesia')) return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop';
        if (m.includes('agama') || m.includes('pai')) return 'https://images.unsplash.com/photo-1609599006353-e629aaab315d?q=80&w=400&auto=format&fit=crop';
        if (m.includes('olahraga') || m.includes('pjok') || m.includes('jasmani')) return 'https://images.unsplash.com/photo-1461896836934-ffe1c749214e?q=80&w=400&auto=format&fit=crop';
        if (m.includes('seni') || m.includes('sbdp') || m.includes('prakarya')) return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400&auto=format&fit=crop';
        
        let shortName = m.replace('ilmu ', '').replace('pelajaran ', '').replace('mata ', '');
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(shortName || 'Kuis')}&background=random&color=fff&size=400&font-size=0.33`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = `Yuk kerjakan kuis *${quiz?.title || 'Kuis'}* (${quiz?.subject?.name || 'Mapel'})!\n\nKlik link berikut untuk mulai mengerjakan:\n${shareUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleQR = () => {
        alert(`Tampilkan QR Code untuk link:\n${shareUrl}`);
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Quiz Dibagikan / {quiz?.subject?.name || '-'}</div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Quiz Dibagikan</h1>
                    <p className="text-sm sm:text-base text-gray-500">Tautan kuis siap disebarkan ke peserta didik.</p>
                </div>
                <Link to="/pengaturan" className="hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#1b6d39] text-white items-center justify-center font-bold text-xl sm:text-2xl shadow-sm hover:ring-4 hover:ring-green-100 transition-all cursor-pointer shrink-0">
                    {initial}
                </Link>
            </div>

            <div className="bg-[#1b6d39] rounded-3xl p-6 sm:p-10 text-white mb-8 sm:mb-16 shadow-xl relative mt-2">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-white text-[#1b6d39] font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm shadow-md tracking-wide">
                        AKTIF
                    </span>
                </div>

                <div className="w-full max-w-2xl relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                        Quiz siap dibagikan! 🎉
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-green-50">{quiz?.subject?.name || '-'} — {quiz?.title || '-'}</h3>
                    <p className="text-green-200/90 text-sm sm:text-base mb-6 sm:mb-8 font-medium">{quiz?.student_class?.name || '-'} {quiz?.time_limit_minutes > 0 ? `• ${quiz.time_limit_minutes} menit` : '• Tanpa Batas Waktu'}</p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#14532b] p-2 rounded-2xl border border-[#238b49] shadow-inner max-w-lg gap-2">
                        <div className="px-3 sm:px-4 text-green-100 flex-1 truncate font-medium text-xs sm:text-sm py-2">
                            {shareUrl}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="bg-[#F2994A] hover:bg-[#e0893d] transition-colors text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-2 shadow-md shrink-0 text-xs sm:text-sm"
                        >
                            {copied ? <><Check size={18} /> Disalin</> : 'Salin'}
                        </button>
                    </div>
                </div>
                
                {/* Floating Mapel Image on Desktop */}
                <div className="hidden md:block absolute -bottom-10 lg:-bottom-12 right-6 lg:right-12 z-20">
                    <div className="h-36 w-36 lg:h-44 lg:w-44 bg-white rounded-2xl shadow-2xl p-2">
                        <div className="w-full h-full bg-gray-200 rounded-xl overflow-hidden relative">
                            <img 
                                src={getSubjectImage(quiz?.subject?.name)} 
                                alt="Ilustrasi Mapel" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 px-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Bagikan link ke siswa</h3>
                <p className="text-gray-500 font-medium text-xs sm:text-sm">Siswa tidak perlu membuat akun. Cukup buka link, isi nama, lalu mulai mengerjakan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div onClick={handleWhatsApp} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shrink-0">
                        <MessageCircle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">WhatsApp</div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">Bagikan ke grup kelas</div>
                    </div>
                </div>

                <div onClick={handleQR} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-orange-50 flex items-center justify-center text-[#F2994A] group-hover:scale-110 transition-transform shrink-0">
                        <QrCode size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">QR Code</div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">Tampilkan di kelas</div>
                    </div>
                </div>

                <div onClick={handleCopy} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                        <LinkIcon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">Salin Link</div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">Tempel di LMS / chat</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}