import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Book, Users, Trash2, Plus, Loader2 } from 'lucide-react';

export default function MasterData() {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newSubject, setNewSubject] = useState('');
    const [newClass, setNewClass] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/master-data');
            setSubjects(response.data.subjects);
            setClasses(response.data.classes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/master-data/subjects', { name: newSubject });
            setNewSubject('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menambahkan mata pelajaran');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!confirm('Hapus mata pelajaran ini?')) return;
        try {
            await axios.delete(`/api/master-data/subjects/${id}`);
            fetchData();
        } catch (error) {
            alert('Gagal menghapus data');
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        if (!newClass.trim()) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/master-data/classes', { name: newClass });
            setNewClass('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menambahkan kelas');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!confirm('Hapus kelas ini?')) return;
        try {
            await axios.delete(`/api/master-data/classes/${id}`);
            fetchData();
        } catch (error) {
            alert('Gagal menghapus data');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Beranda / Master Data</div>
            
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Master Data</h1>
                <p className="text-sm sm:text-base text-gray-500">Kelola daftar Mata Pelajaran dan Kelas untuk form kuis.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-[#1b6d39]" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Mata Pelajaran */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl"><Book size={22} /></div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Mata Pelajaran</h2>
                        </div>

                        <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-2 mb-6">
                            <input 
                                type="text" 
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Tambah Mapel Baru..." 
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-xs sm:text-sm font-medium"
                            />
                            <button disabled={isSubmitting} type="submit" className="bg-[#1b6d39] hover:bg-[#14532b] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-colors text-xs sm:text-sm shrink-0">
                                <Plus size={18} /> Tambah
                            </button>
                        </form>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {subjects.map(subject => (
                                <div key={subject.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                    <span className="font-bold text-gray-700 text-xs sm:text-sm">{subject.name}</span>
                                    <button onClick={() => handleDeleteSubject(subject.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {subjects.length === 0 && <div className="text-center text-gray-400 py-6 text-sm font-medium">Belum ada data</div>}
                        </div>
                    </div>

                    {/* Kelas */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl"><Users size={22} /></div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Kelas</h2>
                        </div>

                        <form onSubmit={handleAddClass} className="flex flex-col sm:flex-row gap-2 mb-6">
                            <input 
                                type="text" 
                                value={newClass}
                                onChange={(e) => setNewClass(e.target.value)}
                                placeholder="Tambah Kelas Baru..." 
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-xs sm:text-sm font-medium"
                            />
                            <button disabled={isSubmitting} type="submit" className="bg-[#F2994A] hover:bg-[#e0893d] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-colors text-xs sm:text-sm shrink-0">
                                <Plus size={18} /> Tambah
                            </button>
                        </form>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {classes.map(cls => (
                                <div key={cls.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                    <span className="font-bold text-gray-700 text-xs sm:text-sm">{cls.name}</span>
                                    <button onClick={() => handleDeleteClass(cls.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {classes.length === 0 && <div className="text-center text-gray-400 py-6 text-sm font-medium">Belum ada data</div>}
                        </div>
                    </div>

                </div>
            )}
        </AdminLayout>
    );
}