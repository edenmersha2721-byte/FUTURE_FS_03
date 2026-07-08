import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, CheckCircle2, XCircle, Check, Phone, Mail } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { appointmentApi } from '../../api/endpoints.js';
import { currency, formatDate, formatTime, statusColor } from '../../utils/format.js';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    appointmentApi.list(params).then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const setStatusOf = async (id, s) => {
    try {
      await appointmentApi.updateStatus(id, s);
      toast.success(`Marked as ${s}`);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Update failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setStatus(f)} className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${status === f ? 'border-charcoal bg-charcoal text-cream' : 'border-sand bg-white hover:border-gold'}`}>{f}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search name, email, service…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </div>

      {loading ? <Loader /> : items.length === 0 ? (
        <div className="card py-16 text-center text-muted">No appointments found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date &amp; Time</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-sand/60 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{a.customer_name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted"><Mail size={11} /> {a.customer_email}</p>
                    {a.customer_phone && <p className="flex items-center gap-1 text-xs text-muted"><Phone size={11} /> {a.customer_phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted">{a.service_name || a.service_name_snapshot}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(a.appointment_date)}<br />{formatTime(a.appointment_time)}</td>
                  <td className="px-4 py-3 font-medium text-gold-dark">{currency(a.price_snapshot)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {a.status === 'pending' && (
                        <button onClick={() => setStatusOf(a.id, 'confirmed')} title="Confirm" className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"><Check size={15} /></button>
                      )}
                      {['pending', 'confirmed'].includes(a.status) && (
                        <>
                          <button onClick={() => setStatusOf(a.id, 'completed')} title="Complete" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>
                          <button onClick={() => setStatusOf(a.id, 'cancelled')} title="Cancel" className="rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"><XCircle size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
