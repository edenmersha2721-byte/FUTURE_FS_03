import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Trash2, Plus } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { reviewApi, serviceApi } from '../../api/endpoints.js';
import { formatDate } from '../../utils/format.js';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, comment: '', service_id: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([reviewApi.mine(), serviceApi.list({ active: 'true' })])
      .then(([r, s]) => {
        setReviews(r.data.data);
        setServices(s.data.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return toast.error('Please write a comment');
    setSaving(true);
    try {
      await reviewApi.create({
        rating: form.rating,
        comment: form.comment,
        service_id: form.service_id || null,
      });
      toast.success('Thank you for your review!');
      setForm({ rating: 5, comment: '', service_id: '' });
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not submit review');
    } finally {
      setSaving(false);
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
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Form */}
      <div className="card h-max p-6">
        <h3 className="flex items-center gap-2 font-serif text-2xl"><Plus size={20} /> Write a Review</h3>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                  <Star size={28} className={n <= form.rating ? 'fill-gold text-gold' : 'text-sand'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Service (optional)</label>
            <select className="input" value={form.service_id} onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}>
              <option value="">General</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Your Review</label>
            <textarea rows={4} className="input resize-none" placeholder="Share your experience…" value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
          </div>
          <button disabled={saving} className="btn-gold w-full">{saving ? 'Submitting…' : 'Submit Review'}</button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4 lg:col-span-2">
        {reviews.length === 0 ? (
          <div className="card py-16 text-center text-muted">You haven’t written any reviews yet.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} size={16} className={k < r.rating ? 'fill-gold text-gold' : 'text-sand'} />
                    ))}
                  </div>
                  {r.service_name && <p className="mt-1 text-xs text-muted">{r.service_name}</p>}
                </div>
                <button onClick={() => remove(r.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={17} /></button>
              </div>
              <p className="mt-3 text-muted">“{r.comment}”</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span>{formatDate(r.created_at)}</span>
                {r.is_featured && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold-dark">Featured</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
