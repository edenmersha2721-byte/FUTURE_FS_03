export const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(
    Number(n || 0)
  );

export const duration = (minutes) => {
  const m = Number(minutes || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // dateStr is 'YYYY-MM-DD' — parse as local to avoid TZ shift
  const [y, mo, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = String(timeStr).split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

export const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export const statusColor = (status) =>
  ({
    pending: 'bg-amber-400/15 text-amber-300 border border-amber-400/25',
    confirmed: 'bg-blue-400/15 text-blue-300 border border-blue-400/25',
    completed: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/25',
    cancelled: 'bg-rose-400/15 text-rose-300 border border-rose-400/25',
  }[status] || 'bg-white/10 text-cream/70 border border-line');
