import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Clock, User } from 'lucide-react';

export default function StudentQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [quiz, setQuiz] = useState(location.state?.quiz || null);
    const studentId = location.state?.studentId || null;
    const studentName = location.state?.studentName || '';

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!studentId || !quiz) {
            navigate(`/q/${quizId}`);
            return;
        }
        if (quiz.time_limit_minutes > 0) setTimeRemaining(quiz.time_limit_minutes * 60);
    }, [studentId, quiz, navigate, quizId]);

    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    const handleOptionSelect = (optionId) => setAnswers({ ...answers, [quiz.questions[currentQuestionIndex].id]: optionId });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let correctCount = 0; let wrongCount = 0;
        const answersData = [];

        quiz.questions.forEach(q => {
            const selectedOptionId = answers[q.id];
            const selectedOption = q.options.find(o => o.id === selectedOptionId);
            if (selectedOption?.is_correct) correctCount++; else wrongCount++;
            answersData.push({ question_id: q.id, question_text: q.question_text, selected_option_id: selectedOptionId || null, is_correct: !!selectedOption?.is_correct });
        });

        const timeSpent = (quiz.time_limit_minutes * 60) - timeRemaining;
        const payload = {
            student_id: studentId, student_name: studentName,
            score: Math.round((correctCount / quiz.questions.length) * 100),
            correct_answers: correctCount, wrong_answers: wrongCount,
            time_spent_seconds: timeSpent > 0 ? timeSpent : 0,
            answers_data: answersData
        };

        try {
            await axios.post(`/api/student/quiz/${quizId}/submit`, payload);
            navigate(`/q/${quizId}/result`, { state: { result: payload, quiz, studentAnswers: answers } });
        } catch (error) {
            alert('Gagal mengirimkan kuis.');
            setIsSubmitting(false);
        }
    };

    if (!quiz || !studentId) return null;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* HEADER SERAGAM */}
            <header className="bg-white px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <img src="https://fithrahinsani.org/wp-content/uploads/2023/11/Logo-YFIB.png" alt="Logo" className="h-7 sm:h-9 w-auto" />
                    <h1 className="font-bold text-gray-900 tracking-tight text-sm sm:text-base hidden sm:block">SIT FITHRAH INSANI</h1>
                </div>
                {quiz.time_limit_minutes > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 font-bold bg-orange-50 border border-orange-100 text-orange-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm shrink-0">
                        <Clock size={16} className="hidden sm:block" /> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                )}
            </header>

            {/* KONTEN SERAGAM */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">{quiz.title}</h2>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><User size={12}/> {studentName}</div>
                    </div>
                    <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 text-center">
                        Soal {currentQuestionIndex + 1} / {quiz.questions.length}
                    </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 leading-relaxed">
                        {currentQuestion.question_text}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                        {currentQuestion.options.map(option => (
                            <button
                                key={option.id} onClick={() => handleOptionSelect(option.id)}
                                className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 flex items-center justify-between transition-all ${answers[currentQuestion.id] === option.id ? 'border-[#1b6d39] bg-green-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}
                            >
                                <span className={`text-sm sm:text-base ${answers[currentQuestion.id] === option.id ? 'text-[#1b6d39] font-bold' : 'text-gray-700 font-medium'}`}>{option.option_text}</span>
                                {answers[currentQuestion.id] === option.id && <CheckCircle2 className="text-[#1b6d39] shrink-0 ml-3" size={20} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0}
                        className="w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-700 font-bold px-6 py-3.5 sm:py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-30 transition-colors hover:bg-gray-50 text-sm sm:text-base"
                    >
                        <ChevronLeft size={18} /> Sebelumnya
                    </button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit} disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
                            className="w-full sm:w-auto bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold px-8 py-3.5 sm:py-4 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Kumpulkan Kuis'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3.5 sm:py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
                        >
                            Selanjutnya <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}