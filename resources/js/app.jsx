import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import GenerateQuiz from './Pages/GenerateQuiz';
import ReviewSoal from './Pages/ReviewSoal';
import QuizDibagikan from './Pages/QuizDibagikan';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generate" element={<GenerateQuiz />} />
                <Route path="/review" element={<ReviewSoal />} />
                <Route path="/dibagikan" element={<QuizDibagikan />} />
                <Route path="/q/:quizId" element={<div className="p-10 text-2xl font-bold">Ini Halaman Kuis Anak</div>} />
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}