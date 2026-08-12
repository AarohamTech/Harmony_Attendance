export const formatTime = (timeStr?: string | null): string => {
  if (!timeStr) return '--:--';
  try {
    if (timeStr.length === 8 && timeStr.includes(':')) {
      // String format '09:00:00'
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return timeStr || '--:--';
  }
};
