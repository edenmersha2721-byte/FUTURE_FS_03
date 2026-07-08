import { useEffect, useState } from 'react';
import {
  Users, Scissors, CalendarClock, Clock, CheckCircle2, DollarSign, Mail,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import Loader from '../../components/common/Loader.jsx';
import { dashboardApi } from '../../api/endpoints.js';
import { currency, formatDate, formatTime, statusColor } from '../../utils/format.js';

const STATUS_COLORS = { pending: '#D9A441', confirmed: '#5B8DEF', completed: '#4CAF82', cancelled: '#E06B6B' };

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats().then((r) => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <p className="text-muted">Could not load dashboard.</p>;

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-blue-500/15 text-blue-600' },
    { label: 'Active Services', value: stats.totalServices, icon: Scissors, color: 'bg-purple-500/15 text-purple-600' },
    { label: "Today's Appointments", value: stats.todaysAppointments, icon: CalendarClock, color: 'bg-amber-500/15 text-amber-600' },
    { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'bg-orange-500/15 text-orange-600' },
    { label: 'Completed', value: stats.completedAppointments, icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-600' },
    { label: 'Revenue', value: currency(stats.revenue), icon: DollarSign, color: 'bg-gold/20 text-gold-dark' },
  ];

  const pieData = stats.appointmentsByStatus.map((s) => ({ name: s.status, value: s.count }));

  return (
    <div className="space-y-8">
      {stats.unreadMessages > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-gold/15 px-5 py-3 text-sm text-espresso">
          <Mail size={18} className="text-gold-dark" />
          You have <strong>{stats.unreadMessages}</strong> unread contact message{stats.unreadMessages > 1 ? 's' : ''}.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}><c.icon size={20} /></div>
            <p className="mt-3 font-serif text-2xl font-bold text-charcoal">{c.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-serif text-2xl">Recent Bookings</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-sand">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-sand/60">
                    <td className="py-3 font-medium text-charcoal">{b.customer_name}</td>
                    <td className="py-3 text-muted">{b.service_name}</td>
                    <td className="py-3 text-muted">{formatDate(b.appointment_date)} · {formatTime(b.appointment_time)}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td className="py-3 text-right font-medium text-gold-dark">{currency(b.price_snapshot)}</td>
                  </tr>
                ))}
                {stats.recentBookings.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status chart */}
        <div className="card p-6">
          <h3 className="font-serif text-2xl">Appointments by Status</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {pieData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#C9A15A'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="py-10 text-center text-muted">No data.</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs capitalize text-muted">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
