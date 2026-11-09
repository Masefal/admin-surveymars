import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import { Book, Users, Trash2, Plus, Loader2, Layers } from 'lucide-react';

export default function MasterData() {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ subject_id: '', name: '', description: '' });
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
            setMaterials(response.data.materials || []);
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

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        if (!newMaterial.subject_id || !newMaterial.name.trim()) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/master-data/materials', newMaterial);
            setNewMaterial(prev => ({ ...prev, name: '', description: '' }));
            fetchData();
        } catch (error) {
            const errors = error.response?.data?.errors;
            alert(errors ? Object.values(errors).flat()[0] : 'Gagal menambahkan materi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (!confirm('Hapus materi ini? Soal yang sudah ada tetap tersimpan, tetapi tidak lagi tertaut ke materi ini.')) return;
        try {
            await axios.delete('/api/master-data/materials/' + id);
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
                <p className="text-sm sm:text-base text-gray-500">Kelola daftar Mata Pelajaran, Kelas, dan Materi untuk form kuis.</p>
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


                    {/* Materi */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-50">
                            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl"><Layers size={22} /></div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Materi</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4">Materi dipakai untuk analisis nilai per materi dan sebagai acuan AI. Tulis kisi-kisi atau ringkasan materi dari buku/slide; AI hanya boleh memakai fakta yang tertulis di sini.</p>

                        <form onSubmit={handleAddMaterial} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                            <select
                                value={newMaterial.subject_id}
                                onChange={(e) => setNewMaterial({ ...newMaterial, subject_id: e.target.value })}
                                required
                                aria-label="Mata pelajaran materi"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1b6d39] focus:outline-none text-xs sm:text-sm font-medium"
                            >
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input
                                type="text"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                required
                                maxLength={255}
                                placeholder="Nama materi, mis. Permainan Engklek"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1b6d39] focus:outline-none text-xs sm:text-sm font-medium"
                            />
                            <textarea
                                value={newMaterial.description}
                                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                rows="4"
                                placeholder="Kisi-kisi / ringkasan materi (opsional, tapi sangat disarankan)"
                                className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1b6d39] focus:outline-none text-xs sm:text-sm font-medium resize-y"
                            />
                            <button disabled={isSubmitting} type="submit" className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-colors text-xs sm:text-sm">
                                <Plus size={18} /> Tambah Materi
                            </button>
                        </form>

                        <div className="space-y-2">
                            {materials.map(m => (
                                <details key={m.id} className="p-3 rounded-xl border border-gray-100">
                                    <summary className="flex justify-between items-center gap-3 cursor-pointer list-none">
                                        <span className="min-w-0">
                                            <span className="block font-bold text-gray-700 text-xs sm:text-sm break-words">{m.name}</span>
                                            <span className="block text-[11px] text-gray-400">{subjects.find(s => s.id === m.subject_id)?.name || '-'}{m.description ? ' · ketuk untuk lihat ringkasan' : ' · belum ada ringkasan'}</span>
                                        </span>
                                        <button onClick={(e) => { e.preventDefault(); handleDeleteMaterial(m.id); }} aria-label={'Hapus materi ' + m.name} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </summary>
                                    {m.description && <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-xs text-gray-600 bg-gray-50 rounded-lg p-3 max-h-72 overflow-y-auto">{m.description}</pre>}
                                </details>
                            ))}
                            {materials.length === 0 && <div className="text-center text-gray-400 py-6 text-sm font-medium">Belum ada materi</div>}
                        </div>
                    </div>

                </div>
            )}
        </AdminLayout>
    );
}