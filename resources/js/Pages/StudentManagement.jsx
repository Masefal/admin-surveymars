import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../Layouts/AdminLayout';
import { Users, Loader2, BarChart2 } from 'lucide-react';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/students')
            .then(response => {
                setStudents(response.data);
            })
            .catch(error => {
                console.error("Gagal mengambil data siswa:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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
                                    <th scope="col" className="px-6 py-4">Nama Siswa</th>
                                    <th scope="col" className="px-6 py-4">Kelas</th>
                                    <th scope="col" className="px-6 py-4 text-right">Analisis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                                            Tidak ada data siswa ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}