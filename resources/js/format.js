// Durasi pengerjaan dalam detik → "48 dtk", "2 mnt 5 dtk", "30 mnt"
export const formatDuration = (seconds) => {
    const total = Math.max(0, Math.round(seconds || 0));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;

    if (minutes === 0) return `${rest} dtk`;
    if (rest === 0) return `${minutes} mnt`;
    return `${minutes} mnt ${rest} dtk`;
};

// Buang semua karakter selain angka (dipakai untuk input NISN)
export const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

// Satu kuis bisa dikerjakan beberapa ronde; untuk rata-rata dan jumlah kuis
// pakai hasil TERAKHIR per kuis, lalu catat berapa ronde yang sudah dikerjakan.
export const latestPerQuiz = (results = []) => {
    const byQuiz = new Map();
    [...results]
        .sort((a, b) => (new Date(b.created_at) - new Date(a.created_at)) || (b.id - a.id))
        .forEach(r => {
            const key = r.quiz_id ?? `hapus-${r.id}`;
            const entry = byQuiz.get(key);
            if (entry) entry.rounds += 1;
            else byQuiz.set(key, { ...r, rounds: 1 });
        });
    return [...byQuiz.values()];
};
