import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Ban, CheckCircle2 } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import { customerApi } from '../../api/endpoints.js';
import { currency, formatDate, formatTime, statusColor } from '../../utils/format.js';

export default function AdminCustomers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    customerApi.list(search ? { search } : {}).then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const view = async (id) => {
    const { data } = await customerApi.get(id);
    setDetail(data.data);
  };

  const toggle = async (c) => {
    await customerApi.setStatus(c.id, !c.is_active);
    toast.success(c.is_active ? 'Customer deactivated' : 'Customer activated');
    load();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative w-full max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-9" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>

      {loading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-line/60">
                  <td className="px-4 py-3 font-medium text-cream">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-muted">{c.total_appointments}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.is_active ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/25' : 'bg-white/10 text-muted border border-line'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => view(c.id)} className="rounded-lg p-2 text-blue-300 hover:bg-blue-500/10"><Eye size={15} /></button>
                      <button onClick={() => toggle(c)} className={`rounded-lg p-2 ${c.is_active ? 'text-rose-300 hover:bg-rose-500/10' : 'text-emerald-300 hover:bg-emerald-500/10'}`}>
                        {c.is_active ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Customer Details" size="lg">
        {detail && (
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient font-serif text-2xl font-bold text-charcoal">{detail.name[0]}</div>
              <div>
                <p className="font-serif text-xl text-cream">{detail.name}</p>
                <p className="text-sm text-muted">{detail.email} · {detail.phone || 'no phone'}</p>
              </div>
            </div>
            <h4 className="mt-6 font-medium text-cream/80">Booking History ({detail.appointments.length})</h4>
            <div className="mt-2 max-h-72 space-y-2 overflow-auto">
              {detail.appointments.length === 0 && <p className="text-sm text-muted">No bookings yet.</p>}
              {detail.appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-line p-3 text-sm">
                  <div>
                    <p className="font-medium text-cream">{a.service_name || a.service_name_snapshot}</p>
                    <p className="text-xs text-muted">{formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gold">{currency(a.price_snapshot)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusColor(a.status)}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
