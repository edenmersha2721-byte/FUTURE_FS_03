import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, XCircle } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { appointmentApi } from '../../api/endpoints.js';
import { currency, formatDate, formatTime, statusColor } from '../../utils/format.js';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function CustomerAppointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    appointmentApi.mine().then((r) => setAppts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not cancel');
    }
  };

  const filtered = filter === 'all' ? appts : appts.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
                filter === f ? 'border-charcoal bg-charcoal text-cream' : 'border-sand bg-white hover:border-gold'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link to="/book" className="btn-gold">Book New</Link>
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center text-muted">No {filter !== 'all' ? filter : ''} appointments found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl text-charcoal">{a.service_name || a.service_name_snapshot}</h3>
                  {a.category_name && <p className="text-xs text-muted">{a.category_name}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(a.status)}`}>{a.status}</span>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-muted">
                <p className="flex items-center gap-2"><CalendarDays size={15} className="text-gold-dark" /> {formatDate(a.appointment_date)}</p>
                <p className="flex items-center gap-2"><Clock size={15} className="text-gold-dark" /> {formatTime(a.appointment_time)}</p>
              </div>
              {a.notes && <p className="mt-3 rounded-lg bg-beige/50 p-3 text-sm text-muted">“{a.notes}”</p>}
              <div className="mt-4 flex items-center justify-between border-t border-sand pt-4">
                <span className="font-serif text-xl font-semibold text-gold-dark">{currency(a.price_snapshot)}</span>
                {['pending', 'confirmed'].includes(a.status) && (
                  <button onClick={() => cancel(a.id)} className="btn-outline border-rose-300 text-rose-500 hover:bg-rose-50">
                    <XCircle size={15} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
