import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, Loader2, PlayCircle, User } from 'lucide-react';

export default function StudentLanding() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`/api/student/quiz/${quizId}`)
            .then(response => {
                setQuiz(response.data.quiz);
                setStudents(response.data.students || []);
                setLoading(false);
            })
            .catch(err => {
                setError('Kuis tidak ditemukan atau sudah ditutup.');
                setLoading(false);
            });
    }, [quizId]);

    const handleStart = () => {
        if (!selectedStudent) {
            alert('Silakan pilih nama Anda terlebih dahulu!');
            return;
        }
        const studentData = students.find(s => s.id.toString() === selectedStudent);
        navigate(`/q/${quizId}/play`, { 
            state: { quiz, studentId: studentData.id, studentName: studentData.name } 
        });
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><Loader2 className="animate-spin text-[#1b6d39]" size={40} /></div>;
    
    if (error || !quiz) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full border border-gray-100"><h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2><p className="text-gray-500">{error}</p></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* HEADER SERAGAM */}
            <header className="bg-white px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-7 sm:h-9 w-auto" />
                    <h1 className="font-bold text-gray-900 tracking-tight text-sm sm:text-base hidden sm:block">SIT FITHRAH INSANI</h1>
                </div>
                <div className="font-bold text-gray-400 text-xs sm:text-sm uppercase tracking-wider hidden sm:block">Portal Siswa</div>
            </header>

            {/* KONTEN SERAGAM */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-5/12 bg-[#1b6d39] p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden text-white min-h-[200px] md:min-h-[400px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-tr-full"></div>
                        <div className="relative z-10">
                            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 tracking-wider uppercase">Kuis Baru</span>
                            <h2 className="text-xl sm:text-3xl font-black leading-tight">Siap untuk menguji pengetahuanmu?</h2>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                        <h1 className="text-lg sm:text-2xl font-black text-gray-900 mb-1.5 leading-snug">{quiz.subject?.name} — {quiz.title}</h1>
                        <p className="text-gray-500 font-medium text-xs sm:text-sm mb-6">{quiz.student_class?.name}</p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl border border-gray-100 text-xs sm:text-sm">
                                <BookOpen size={16} className="text-blue-500" /> <span className="font-bold text-gray-700">{quiz.questions?.length || 0} Soal</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl border border-gray-100 text-xs sm:text-sm">
                                <Clock size={16} className="text-orange-500" /> <span className="font-bold text-gray-700">{quiz.time_limit_minutes} Menit</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                    <User size={16} /> Pilih Nama Kamu
                                </label>
                                <select 
                                    value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 sm:py-3.5 focus:border-[#1b6d39] focus:ring-0 outline-none transition-colors bg-white font-medium text-gray-700 text-sm"
                                >
                                    <option value="">-- Cari namamu di sini --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={handleStart} disabled={!selectedStudent}
                                className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm sm:text-base shadow-sm"
                            >
                                <PlayCircle size={18} /> Mulai Mengerjakan
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}