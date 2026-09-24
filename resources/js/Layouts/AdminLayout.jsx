import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, BookOpen, Sparkles, Database, Settings, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    // Close sidebar on mobile navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

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
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
            {/* Mobile Top Header */}
            <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle navigation menu"
                        className="p-2 -ml-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div className="flex items-center gap-2.5">
                        <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-8 w-8" />
                        <div>
                            <span className="font-extrabold text-gray-900 text-sm leading-tight block">SIT FITHRAH INSANI</span>
                            <span className="text-[10px] font-medium text-gray-500 block">Quiz Management</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/pengaturan" className="h-9 w-9 rounded-lg bg-[#1b6d39] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {initial}
                    </Link>
                </div>
            </header>

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
                lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 lg:shrink-0
                ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-10 w-10"/>
                        <span className="font-bold text-gray-800 leading-tight">SIT FITHRAH<br/>INSANI</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menus.map((menu, index) => {
                        const isActive = location.pathname.startsWith(menu.path) || (menu.path === '/generate' && location.pathname.startsWith('/review'));
                        return (
                            <Link 
                                key={index} 
                                to={menu.path} 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive ? 'bg-green-50 text-[#1b6d39] font-bold shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {menu.icon} {menu.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="text-xs font-semibold text-gray-400 mb-2 px-2 tracking-wider">PENGATURAN</div>
                    <Link 
                        to="/pengaturan" 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            location.pathname === '/pengaturan' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Settings size={20} /> Pengaturan
                    </Link>
                    <Link to="/pengaturan" className="mt-3 flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer block">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-[#1b6d39] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                                {initial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-gray-800 truncate">{userName}</div>
                                <div className="text-xs text-gray-500 truncate">{user.email || 'Admin'}</div>
                            </div>
                        </div>
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} /> Keluar Akun
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}