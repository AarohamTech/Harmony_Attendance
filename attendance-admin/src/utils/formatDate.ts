export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '--';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr).slice(0, 10);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return String(dateStr);
  }
};

export const formatDay = (dateStr?: string | null): string => {
  if (!dateStr) return '--';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } catch (e) {
    return '';
  }
};
