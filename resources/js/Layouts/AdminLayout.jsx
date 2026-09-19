import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    FileText, 
    Sparkles, 
    Database, 
    Send, 
    FlaskConical,
    Settings 
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const location = useLocation();

    const menus = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Kelas', icon: <Users size={20} />, path: '/kelas' },
        { name: 'Mata Pelajaran', icon: <BookOpen size={20} />, path: '/mapel' },
        { name: 'Kisi-kisi', icon: <FileText size={20} />, path: '/kisi-kisi' },
        { name: 'Generate Quiz', icon: <Sparkles size={20} />, path: '/generate' },
        { name: 'Bank Soal', icon: <Database size={20} />, path: '/bank-soal' },
        { name: 'Quiz Dibagikan', icon: <Send size={20} />, path: '/dibagikan' },
        { name: 'Hasil Quiz', icon: <FlaskConical size={20} />, path: '/hasil' },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-100">
                    <img 
                        src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" 
                        alt="Logo SIT Fithrah Insani" 
                        className="h-10 w-10"
                    />
                    <span className="font-bold text-gray-800 leading-tight">SIT FITHRAH<br/>INSANI</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menus.map((menu, index) => {
                        const isActive = location.pathname === menu.path;
                        return (
                            <Link 
                                key={index} 
                                to={menu.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'bg-green-50 text-[#1b6d39]' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {menu.icon}
                                {menu.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-400 mb-2 px-2">PENGATURAN</div>
                    <Link to="/pengaturan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Settings size={20} />
                        Pengaturan
                    </Link>
                    <div className="mt-4 flex items-center gap-3 px-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="h-10 w-10 rounded-lg bg-[#1b6d39] text-white flex items-center justify-center font-bold text-lg">
                            S
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800">Bu Siti</div>
                            <div className="text-xs text-gray-500">Admin • SDIT Fithrah Insani</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <div className="p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}