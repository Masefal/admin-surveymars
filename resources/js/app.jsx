import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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