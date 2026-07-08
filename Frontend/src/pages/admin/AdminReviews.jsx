import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Trash2, Award } from 'lucide-react';
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

  const toggleFeatured = async (r) => {
    await reviewApi.update(r.id, { is_featured: !r.is_featured });
    toast.success(r.is_featured ? 'Removed from testimonials' : 'Featured as testimonial');
    load();
  };
  const toggleApproved = async (r) => {
    await reviewApi.update(r.id, { is_approved: !r.is_approved });
    toast.success(r.is_approved ? 'Hidden' : 'Approved');
    load();
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
        <div key={r.id} className={`card p-5 ${!r.is_approved ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={15} className={k < r.rating ? 'fill-gold text-gold' : 'text-sand'} />)}
              </div>
              <p className="mt-1 font-medium text-charcoal">{r.customer_name}</p>
              {r.service_name && <p className="text-xs text-muted">{r.service_name}</p>}
            </div>
            <button onClick={() => remove(r.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
          </div>
          <p className="mt-3 text-sm text-muted">“{r.comment}”</p>
          <p className="mt-2 text-xs text-muted">{formatDate(r.created_at)}</p>
          <div className="mt-4 flex gap-2 border-t border-sand pt-3">
            <button onClick={() => toggleFeatured(r)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${r.is_featured ? 'bg-gold/20 text-gold-dark' : 'bg-beige text-muted hover:bg-sand'}`}>
              <Award size={13} /> {r.is_featured ? 'Featured' : 'Feature'}
            </button>
            <button onClick={() => toggleApproved(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${r.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
              {r.is_approved ? 'Approved' : 'Hidden'}
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="col-span-full py-10 text-center text-muted">No reviews yet.</p>}
    </div>
  );
}
