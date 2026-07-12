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
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users },
    { label: 'Active Services', value: stats.totalServices, icon: Scissors },
    { label: "Today's Appointments", value: stats.todaysAppointments, icon: CalendarClock },
    { label: 'Pending', value: stats.pendingAppointments, icon: Clock },
    { label: 'Completed', value: stats.completedAppointments, icon: CheckCircle2 },
    { label: 'Revenue', value: currency(stats.revenue), icon: DollarSign },
  ];

  const pieData = stats.appointmentsByStatus.map((s) => ({ name: s.status, value: s.count }));

  return (
    <div className="space-y-8">
      {stats.unreadMessages > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/10 px-5 py-3 text-sm text-cream/90">
          <Mail size={18} className="text-gold" />
          You have <strong className="text-gold">{stats.unreadMessages}</strong> unread contact message{stats.unreadMessages > 1 ? 's' : ''}.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card-glow p-5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold"><c.icon size={20} /></div>
            <p className="relative mt-3 gold-text font-serif text-3xl font-bold">{c.value}</p>
            <p className="relative text-xs uppercase tracking-wide text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-serif text-2xl text-cream">Recent Bookings</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-line/60">
                    <td className="py-3 font-medium text-cream">{b.customer_name}</td>
                    <td className="py-3 text-muted">{b.service_name}</td>
                    <td className="py-3 text-muted">{formatDate(b.appointment_date)} · {formatTime(b.appointment_time)}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td className="py-3 text-right font-medium text-gold">{currency(b.price_snapshot)}</td>
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
          <h3 className="font-serif text-2xl text-cream">Appointments by Status</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} stroke="#161211">
                  {pieData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#CBA35C'} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1E1815', border: '1px solid #2B241E', borderRadius: 12, color: '#F6EFE4' }}
                  itemStyle={{ color: '#F6EFE4' }}
                />
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
