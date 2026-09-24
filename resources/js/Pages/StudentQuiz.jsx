import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function StudentQuiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizId } = useParams();
    
    const { quiz, studentName } = location.state || {};
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime] = useState(Date.now());

    const hasTimer = quiz?.time_limit_minutes > 0;
    const [timeRemaining, setTimeRemaining] = useState(hasTimer ? quiz.time_limit_minutes * 60 : null);

    useEffect(() => {
        if (!quiz || !studentName) {
            navigate(`/q/${quizId}`);
        }
    }, [quiz, studentName, navigate, quizId]);

    useEffect(() => {
        if (!hasTimer) return;
        
        if (timeRemaining <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, hasTimer]);

    if (!quiz) return null;

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleSelectOption = (optionId) => {
        setAnswers({ ...answers, [currentQuestion.id]: optionId });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        let correctCount = 0;
        questions.forEach(q => {
            const selectedOptId = answers[q.id];
            const correctOpt = q.options.find(o => o.is_correct);
            if (correctOpt && selectedOptId === correctOpt.id) {
                correctCount++;
            }
        });

        const wrongCount = questions.length - correctCount;
        const finalScore = Math.round((correctCount / questions.length) * 100);
        
        const timeSpent = hasTimer 
            ? (quiz.time_limit_minutes * 60) - timeRemaining 
            : Math.floor((Date.now() - startTime) / 1000);

        const answersData = questions.map(q => {
            const selectedOptId = answers[q.id];
            const selectedOpt = q.options.find(o => o.id === selectedOptId);
            const correctOpt = q.options.find(o => o.is_correct);
            return {
                question_text: q.question_text,
                is_correct: correctOpt && selectedOptId === correctOpt.id,
                student_answer: selectedOpt ? selectedOpt.option_text : 'Tidak dijawab',
                correct_answer: correctOpt ? correctOpt.option_text : '-'
            };
        });

        const payload = {
            student_name: studentName,
            score: finalScore,
            correct_answers: correctCount,
            wrong_answers: wrongCount,
            time_spent_seconds: timeSpent,
            answers_data: answersData
        };

        try {
            await axios.post(`/api/student/quiz/${quizId}/submit`, payload);
            sessionStorage.setItem(`quiz_result_${quizId}`, JSON.stringify({ result: payload, quiz: quiz, studentAnswers: answers }));
            navigate(`/q/${quizId}/result`, { state: { result: payload, quiz: quiz, studentAnswers: answers } });
        } catch (error) {
            alert("Gagal menyimpan hasil. Silakan coba lagi.");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm relative">
                <header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-white sticky top-0 z-20 border-b border-gray-50">
                    <div className="flex justify-between items-end mb-2.5">
                        <h1 className="font-bold text-gray-900 truncate pr-3 text-base sm:text-lg">{quiz.title}</h1>
                        <span className="text-[#1b6d39] font-bold text-xs sm:text-sm whitespace-nowrap">{currentIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-[#1b6d39] h-1.5 sm:h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
                    <div className="flex justify-end mb-4 min-h-[30px]">
                        {hasTimer && (
                            <div className="bg-orange-50 text-[#F2994A] font-bold px-3.5 py-1 rounded-full text-xs sm:text-sm border border-orange-100">
                                {formatTime(timeRemaining)}
                            </div>
                        )}
                    </div>

                    <div className="mb-6 sm:mb-8">
                        <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1.5">Pertanyaan {currentIndex + 1}</div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">{currentQuestion?.question_text}</h2>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = answers[currentQuestion.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelectOption(option.id)}
                                    className={`w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left ${
                                        isSelected ? 'border-[#1b6d39] bg-green-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'border-[#1b6d39]' : 'border-gray-300'
                                    }`}>
                                        {isSelected && <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#1b6d39] rounded-full"></div>}
                                    </div>
                                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                                        <span className="mr-1.5 sm:mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span> {option.option_text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-4 sm:pt-6 flex gap-3 sm:gap-4 border-t border-gray-50">
                        <button 
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="flex-1 bg-white border-2 border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-gray-700 font-bold rounded-xl py-3 sm:py-3.5 flex justify-center items-center gap-1.5 transition-all text-xs sm:text-sm"
                        >
                            <ArrowLeft size={18} /> Prev
                        </button>
                        {isLastQuestion ? (
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] bg-[#F2994A] hover:bg-[#e0893d] disabled:bg-gray-400 text-white font-bold rounded-xl py-3 sm:py-3.5 flex justify-center items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Kumpulkan'} <CheckCircle2 size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex-[2] bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold rounded-xl py-3 sm:py-3.5 flex justify-center items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm"
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}