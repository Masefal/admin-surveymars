import axios from 'axios';

/**
 * Verifikasi siswa lalu mulai ronde berikutnya.
 * Server menentukan soal ronde ini: ronde 1 semua soal, ronde berikutnya hanya soal yang masih salah.
 * Mengembalikan { completed: true } bila semua soal sudah benar (tidak perlu mengulang).
 */
export async function startRound({ quizCode, quiz, studentId, nisn, navigate }) {
    const { data } = await axios.post(`/api/student/quiz/${quizCode}/verify`, { student_id: studentId, nisn });

    if (data.completed) {
        return { completed: true, student: data.student };
    }

    navigate(`/q/${quizCode}/play`, {
        state: {
            quiz: { ...quiz, questions: data.questions },
            studentId: data.student.id,
            studentName: data.student.name,
            nisn,
            round: data.round,
            totalQuestions: data.total_questions,
        },
    });

    return { completed: false };
}

export const verifyErrorMessage = (err) => {
    const errors = err.response?.data?.errors;
    return (errors && Object.values(errors).flat()[0]) || err.response?.data?.error || 'Gagal memverifikasi. Coba lagi.';
};
