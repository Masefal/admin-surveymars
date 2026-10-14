import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { Users, Loader2, BarChart2, Plus, X } from 'lucide-react';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        nisn: '',
        student_class_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const studentRes = await axios.get('/api/students');
            const studentData = studentRes.data;
            if (Array.isArray(studentData)) {
                setStudents(studentData);
            } else if (studentData && Array.isArray(studentData.data)) {
                setStudents(studentData.data);
            } else {
                setStudents([]);
            }
            
            const masterRes = await axios.get('/api/master-data');
            const masterData = masterRes.data;
            if (masterData && Array.isArray(masterData.classes)) {
                setClasses(masterData.classes);
            } else if (Array.isArray(masterData)) {
                setClasses(masterData);
            } else {
                setClasses([]);
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setStudents([]);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            await axios.post('/api/students', formData);
            setShowModal(false);
            setFormData({ name: '', nisn: '', student_class_id: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menambahkan siswa. Pastikan NISN belum terdaftar.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Manajemen / Kelola Siswa</div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                        <Users className="text-[#1b6d39]" /> Kelola Siswa
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">Daftar siswa dan pantauan analitik individu.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors text-sm sm:text-base shadow-sm"
                >
                    <Plus size={20} /> Tambah Siswa
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center p-10">
                        <Loader2 className="animate-spin text-[#1b6d39]" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4">NISN</th>
                                    <th scope="col" className="px-6 py-4">Nama Siswa</th>
                                    <th scope="col" className="px-6 py-4">Kelas</th>
                                    <th scope="col" className="px-6 py-4 text-right">Analisis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(students) && students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-600">{student.nisn || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-green-100">
                                                    {student.student_class?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    to={`/students/${student.id}/report`}
                                                    className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold transition-colors text-xs"
                                                >
                                                    <BarChart2 size={16} /> Lihat Rapor
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                            Tidak ada data siswa ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">Tambah Data Siswa</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">NISN</label>
                                <input 
                                    type="text" 
                                    name="nisn"
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    placeholder="Masukkan 10 digit NISN" 
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1b6d39] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama Siswa" 
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1b6d39] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kelas</label>
                                <select 
                                    name="student_class_id"
                                    value={formData.student_class_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1b6d39] outline-none bg-white"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {Array.isArray(classes) && classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}