import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import ImageInput from '../../components/common/ImageInput.jsx';
import { promotionApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

const empty = { title: '', description: '', discount: '', discount_type: 'percentage', image_url: '', start_date: '', end_date: '', is_active: true };

export default function AdminPromotions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    promotionApi.list().then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title, description: p.description || '', discount: p.discount, discount_type: p.discount_type,
      image_url: p.image_url || '', start_date: p.start_date || '', end_date: p.end_date || '', is_active: p.is_active,
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await promotionApi.update(editing, form); toast.success('Promotion updated'); }
      else { await promotionApi.create(form); toast.success('Promotion created'); }
      setModal(false); load();
    } catch (e) { toast.error(e.friendlyMessage || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this promotion?')) return;
    await promotionApi.remove(id);
    toast.success('Promotion deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-gold"><Plus size={16} /> Add Promotion</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            <div className="relative h-36 overflow-hidden">
              <img src={assetUrl(p.image_url) || 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80'} alt="" className="h-full w-full object-cover" />
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-1 text-xs font-bold text-charcoal">
                <Tag size={11} />{p.discount_type === 'percentage' ? `${p.discount}%` : `$${p.discount}`} OFF
              </span>
              {!p.is_active && <span className="absolute left-2 top-2 rounded-full bg-charcoal/80 px-2 py-0.5 text-xs text-cream">Inactive</span>}
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-cream">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>
              {p.end_date && <p className="mt-2 text-xs text-muted">Until {formatDate(p.end_date)}</p>}
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-blue-300 hover:bg-blue-500/10"><Pencil size={15} /></button>
                <button onClick={() => remove(p.id)} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full py-10 text-center text-muted">No promotions yet.</p>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Promotion' : 'Add Promotion'} size="lg">
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea rows={2} className="input resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Discount</label>
            <input type="number" min="0" className="input" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <ImageInput label="Promotion Image" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
