import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { appointmentApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { currency, formatDate, formatTime, statusColor, todayISO } from '../../utils/format.js';

export default function CustomerHome() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi.mine().then((r) => setAppts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const today = todayISO();
  const upcoming = appts.filter((a) => a.appointment_date >= today && !['cancelled', 'completed'].includes(a.status));
  const completed = appts.filter((a) => a.status === 'completed');
  const pending = appts.filter((a) => a.status === 'pending');

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: CalendarDays },
    { label: 'Pending', value: pending.length, icon: Clock },
    { label: 'Completed', value: completed.length, icon: CheckCircle2 },
    { label: 'Total Visits', value: appts.length, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="overflow-hidden rounded-3xl bg-gold-gradient p-8 text-charcoal">
        <p className="font-script text-2xl">Welcome back,</p>
        <h2 className="font-serif text-3xl font-semibold">{user?.name?.split(' ')[0]} ✨</h2>
        <p className="mt-2 max-w-lg text-charcoal/80">Ready to treat yourself? Book your next appointment and enjoy a luxurious experience.</p>
        <Link to="/book" className="btn-dark mt-5">Book New Appointment <ArrowRight size={16} /></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <s.icon size={22} />
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-cream">{s.value}</p>
              <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl">Upcoming Appointments</h3>
          <Link to="/dashboard/appointments" className="text-sm font-medium text-gold hover:underline">View all</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-10 text-center text-muted">
            <p>No upcoming appointments.</p>
            <Link to="/book" className="btn-gold mt-4">Book Now</Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {upcoming.slice(0, 4).map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div>
                  <p className="font-medium text-cream">{a.service_name || a.service_name_snapshot}</p>
                  <p className="text-sm text-muted">{formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif font-semibold text-gold">{currency(a.price_snapshot)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(a.status)}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
