import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Mail, Phone, Clock, CalendarClock } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { inspirationApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';
import { formatDate, formatTime } from '../../utils/format.js';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

const STATUS_BADGE = {
  pending: 'bg-amber-400/15 text-amber-300 border border-amber-400/25',
  approved: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/25',
  rejected: 'bg-rose-400/15 text-rose-300 border border-rose-400/25',
};

export default function AdminInspirations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    inspirationApi.list(params).then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const approve = async (id) => {
    try {
      await inspirationApi.approve(id);
      toast.success('Approved — appointment confirmed and added to Appointments.');
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not approve');
    }
  };

  const reject = async (id) => {
    try {
      await inspirationApi.reject(id);
      toast.success('Request rejected');
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not reject');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this inspiration request?')) return;
    await inspirationApi.remove(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
              filter === f ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line bg-white/5 hover:border-gold'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="card py-16 text-center text-muted">No inspiration requests {filter !== 'all' ? `(${filter})` : ''}.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="card overflow-hidden">
              <div className="relative aspect-video overflow-hidden bg-white/[0.03]">
                <a href={assetUrl(it.image_url)} target="_blank" rel="noreferrer">
                  <img
                    src={assetUrl(it.image_url)}
                    alt="inspiration"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `50% ${it.image_pos_y ?? 50}%`, transform: `scale(${Number(it.image_zoom) || 1})` }}
                  />
                </a>
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_BADGE[it.status] || ''}`}>
                  {it.status}
                </span>
              </div>
              <div className="p-4">
                <p className="font-medium text-cream">{it.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted"><Mail size={11} /> {it.email}</p>
                {it.phone && <p className="flex items-center gap-1 text-xs text-muted"><Phone size={11} /> {it.phone}</p>}

                {it.preferred_date && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gold">
                    <CalendarClock size={14} /> Wants: {formatDate(it.preferred_date)} · {formatTime(it.preferred_time)}
                  </p>
                )}
                {it.note && <p className="mt-2 rounded-lg bg-white/[0.03] p-2.5 text-sm text-muted">“{it.note}”</p>}
                <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Clock size={11} /> Requested {formatDate(it.created_at)}</p>

                {it.status === 'approved' ? (
                  <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-center text-xs font-medium text-emerald-300">
                    ✓ Appointment confirmed — see Appointments
                  </p>
                ) : it.status === 'rejected' ? (
                  <p className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-center text-xs font-medium text-rose-300">
                    Rejected
                  </p>
                ) : (
                  <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
                    <button onClick={() => approve(it.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25">
                      <Check size={14} /> Approve &amp; Confirm
                    </button>
                    <button onClick={() => reject(it.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/25">
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <button onClick={() => remove(it.id)} title="Delete" className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-rose-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
