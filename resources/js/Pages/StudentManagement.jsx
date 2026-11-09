import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { Users, Loader2, BarChart2, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { NeedsAttentionNote, PASSING_PERCENT } from '../Components/MaterialPerformance';
import { onlyDigits } from '../format';

const EMPTY_FORM = { name: '', nisn: '', student_class_id: '' };

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // null = tambah siswa baru; berisi id = sedang mengubah siswa tersebut
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);

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

    const openAdd = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (student) => {
        setEditingId(student.id);
        setFormData({ name: student.name, nisn: student.nisn || '', student_class_id: student.student_class_id });
        setFormError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'nisn' ? onlyDigits(value).slice(0, 10) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.nisn.length !== 10) {
            setFormError('NISN harus berupa 10 angka.');
            return;
        }
        setSubmitting(true);
        setFormError('');

        try {
            if (editingId) {
                await axios.put(`/api/students/${editingId}`, formData);
            } else {
                await axios.post('/api/students', formData);
            }
            setShowModal(false);
            setFormData(EMPTY_FORM);
            setEditingId(null);
            fetchData();
        } catch (error) {
            const errors = error.response?.data?.errors;
            setFormError(errors ? Object.values(errors).flat()[0] : (error.response?.data?.message || 'Gagal menyimpan data siswa.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (student) => {
        const ok = window.confirm(
            `Hapus siswa "${student.name}"?\n\nSemua nilai dan riwayat kuis siswa ini, termasuk kuis personal khusus untuknya, ikut terhapus dan tidak bisa dikembalikan.`
        );
        if (!ok) return;
        setDeletingId(student.id);
        try {
            await axios.delete(`/api/students/${student.id}`);
            setStudents(prev => prev.filter(s => s.id !== student.id));
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus siswa.');
        } finally {
            setDeletingId(null);
        }
    };

    const actionButtons = (student, compact = false) => (
        <div className="flex items-center justify-end gap-1.5">
            <Link
                to={`/students/${student.id}/report`}
                className="whitespace-nowrap inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold transition-colors text-xs"
            >
                <BarChart2 size={compact ? 14 : 16} /> {compact ? 'Rapor' : 'Lihat Rapor'}
            </Link>
            <button
                type="button"
                onClick={() => openEdit(student)}
                aria-label={`Ubah data ${student.name}`}
                title="Ubah"
                className="p-2 rounded-lg text-gray-500 hover:text-[#1b6d39] hover:bg-green-50 transition-colors"
            >
                <Pencil size={16} />
            </button>
            <button
                type="button"
                onClick={() => handleDelete(student)}
                disabled={deletingId === student.id}
                aria-label={`Hapus ${student.name}`}
                title="Hapus"
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
                {deletingId === student.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-2 text-xs sm:text-sm font-medium text-gray-400">Manajemen / Kelola Siswa</div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                        <Users className="text-[#1b6d39]" /> Kelola Siswa
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">Daftar siswa dan performa per materi. Materi dengan ketuntasan di bawah {PASSING_PERCENT}% ditandai perlu perhatian khusus.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm sm:text-base shadow-sm whitespace-nowrap shrink-0"
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
                    <>
                    {/* Layar kecil: kartu per siswa supaya tidak perlu geser ke samping */}
                    <ul className="md:hidden divide-y divide-gray-100">
                        {students.length > 0 ? students.map((student) => (
                            <li key={student.id} className="p-4 space-y-3">
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-900 break-words">{student.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">NISN {student.nisn || '-'} · {student.student_class?.name || '-'}</div>
                                </div>
                                <NeedsAttentionNote items={student.needs_attention || []} hasData={(student.material_performance || []).length > 0} />
                                {actionButtons(student, true)}
                            </li>
                        )) : (
                            <li className="p-8 text-center text-gray-400 text-sm">Tidak ada data siswa ditemukan.</li>
                        )}
                    </ul>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 lg:px-6 py-4 whitespace-nowrap">NISN</th>
                                    <th scope="col" className="px-4 lg:px-6 py-4 whitespace-nowrap">Nama Siswa</th>
                                    <th scope="col" className="px-4 lg:px-6 py-4 whitespace-nowrap">Kelas</th>
                                    <th scope="col" className="px-4 lg:px-6 py-4 min-w-[240px]">Materi Perlu Perhatian</th>
                                    <th scope="col" className="px-4 lg:px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 lg:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">{student.nisn || '-'}</td>
                                            <td className="px-4 lg:px-6 py-4 font-bold text-gray-900 min-w-[140px]">{student.name}</td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-green-100">
                                                    {student.student_class?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4">
                                                <NeedsAttentionNote items={student.needs_attention || []} hasData={(student.material_performance || []).length > 0} />
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 text-right">
                                                {actionButtons(student)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                            Tidak ada data siswa ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div role="dialog" aria-modal="true" className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">{editingId ? 'Ubah Data Siswa' : 'Tambah Data Siswa'}</h3>
                            <button onClick={() => setShowModal(false)} aria-label="Tutup" className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">NISN</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    name="nisn"
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    placeholder="Masukkan 10 digit NISN"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#1b6d39] outline-none tracking-widest"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Hanya angka, {formData.nisn.length}/10 digit.</p>
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
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {formError && <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{formError}</p>}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Simpan Perubahan' : 'Simpan Data')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
