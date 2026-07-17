import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Trash2, Check, X } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { reviewApi } from '../../api/endpoints.js';
import { formatDate } from '../../utils/format.js';

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    reviewApi.all().then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (r, status) => {
    try {
      await reviewApi.update(r.id, { status });
      toast.success(status === 'approved' ? 'Approved — now shown on the homepage' : 'Rejected — hidden from the homepage');
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not update review');
    }
  };
  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    await reviewApi.remove(id);
    toast.success('Review deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((r) => (
        <div key={r.id} className={`card p-5 ${r.status !== 'approved' ? 'opacity-70' : ''}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={15} className={k < r.rating ? 'fill-gold text-gold' : 'text-sand'} />)}
              </div>
              <p className="mt-1 font-medium text-cream">{r.customer_name}</p>
              {r.service_name && <p className="text-xs text-muted">{r.service_name}</p>}
            </div>
            <button onClick={() => remove(r.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
          </div>
          <p className="mt-3 text-sm text-muted">“{r.comment}”</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span>{formatDate(r.created_at)}</span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${
              r.status === 'approved' ? 'bg-emerald-400/15 text-emerald-300'
              : r.status === 'rejected' ? 'bg-rose-400/15 text-rose-300'
              : 'bg-amber-400/15 text-amber-300'
            }`}>
              {r.status === 'approved' ? 'Published' : r.status === 'rejected' ? 'Rejected' : 'Pending'}
            </span>
          </div>
          <div className="mt-4 flex gap-2 border-t border-line pt-3">
            <button
              onClick={() => setStatus(r, 'approved')}
              disabled={r.status === 'approved'}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={14} /> Approve
            </button>
            <button
              onClick={() => setStatus(r, 'rejected')}
              disabled={r.status === 'rejected'}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={14} /> Reject
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="col-span-full py-10 text-center text-muted">No reviews yet.</p>}
    </div>
  );
}
