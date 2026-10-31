// Durasi pengerjaan dalam detik → "48 dtk", "2 mnt 5 dtk", "30 mnt"
export const formatDuration = (seconds) => {
    const total = Math.max(0, Math.round(seconds || 0));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;

    if (minutes === 0) return `${rest} dtk`;
    if (rest === 0) return `${minutes} mnt`;
    return `${minutes} mnt ${rest} dtk`;
};
