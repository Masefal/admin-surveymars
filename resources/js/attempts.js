// Pilihan kesempatan mengerjakan kuis per siswa; '' berarti tidak dibatasi
export const ATTEMPT_OPTIONS = [
    { value: '1', label: '1 kali' },
    { value: '2', label: '2 kali' },
    { value: '3', label: '3 kali' },
    { value: '5', label: '5 kali' },
    { value: '', label: 'Tidak dibatasi' },
];

export const attemptLabel = (maxAttempts) => (maxAttempts ? `${maxAttempts} kali` : 'Tidak dibatasi');
