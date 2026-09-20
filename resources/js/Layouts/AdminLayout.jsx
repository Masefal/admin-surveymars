import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, BookOpen, Sparkles, Database, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const menus = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Master Data', icon: <Database size={20} />, path: '/master-data' },
        { name: 'Generate Quiz', icon: <Sparkles size={20} />, path: '/generate' },
        { name: 'Bank Soal', icon: <BookOpen size={20} />, path: '/quizzes' }
    ];

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-100">
                    <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-10 w-10"/>
                    <span className="font-bold text-gray-800 leading-tight">SIT FITHRAH<br/>INSANI</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menus.map((menu, index) => {
                        const isActive = location.pathname.startsWith(menu.path) || (menu.path === '/generate' && location.pathname.startsWith('/review'));
                        return (
                            <Link key={index} to={menu.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-[#1b6d39]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                {menu.icon} {menu.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-400 mb-2 px-2">PENGATURAN</div>
                    <Link to="/pengaturan" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/pengaturan' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Settings size={20} /> Pengaturan
                    </Link>
                    <Link to="/pengaturan" className="mt-4 flex items-center gap-3 px-2 cursor-pointer hover:opacity-80 transition-opacity block">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1b6d39] text-white flex items-center justify-center font-bold text-lg">{initial}</div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">{userName}</div>
                                <div className="text-xs text-gray-500 truncate w-32">{user.email || 'Admin'}</div>
                            </div>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={20} /> Keluar Akun
                    </button>
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