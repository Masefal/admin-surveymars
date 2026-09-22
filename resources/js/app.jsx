import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import QuizList from './Pages/QuizList';
import MasterData from './Pages/MasterData';
import GenerateQuiz from './Pages/GenerateQuiz';
import ReviewSoal from './Pages/ReviewSoal';
import QuizDibagikan from './Pages/QuizDibagikan';
import QuizDetail from './Pages/QuizDetail';
import StudentLanding from './Pages/StudentLanding';
import StudentQuiz from './Pages/StudentQuiz';
import StudentResult from './Pages/StudentResult';
import Pengaturan from './Pages/Pengaturan';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/master-data" element={<MasterData />} />
                <Route path="/generate" element={<GenerateQuiz />} />
                <Route path="/review" element={<ReviewSoal />} />
                <Route path="/dibagikan" element={<QuizDibagikan />} />
                <Route path="/quiz/:id" element={<QuizDetail />} />
                <Route path="/pengaturan" element={<Pengaturan />} />
                <Route path="/q/:quizId" element={<StudentLanding />} />
                <Route path="/q/:quizId/play" element={<StudentQuiz />} />
                <Route path="/q/:quizId/result" element={<StudentResult />} />
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}