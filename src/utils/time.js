export const formatDuration = (seconds, { showHours = true } = {}) => {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainingSeconds = total % 60;

    if (showHours && hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    const totalMinutes = showHours ? minutes : Math.floor(total / 60);
    return `${totalMinutes}:${String(remainingSeconds).padStart(2, "0")}`;
};
