import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import ImageInput from '../../components/common/ImageInput.jsx';
import { categoryApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';

const empty = { name: '', description: '', image_url: '', is_active: true };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    categoryApi.list().then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', is_active: c.is_active });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await categoryApi.update(editing, form); toast.success('Category updated'); }
      else { await categoryApi.create(form); toast.success('Category created'); }
      setModal(false); load();
    } catch (e) { toast.error(e.friendlyMessage || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category? Services in it will be uncategorized.')) return;
    await categoryApi.remove(id);
    toast.success('Category deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-gold"><Plus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="card overflow-hidden">
            <div className="h-28 overflow-hidden">
              <img src={assetUrl(c.image_url) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80'} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-charcoal">{c.name}</h3>
                <span className="rounded-full bg-beige px-2 py-0.5 text-xs text-muted">{c.service_count} services</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>
                <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <ImageInput label="Category Image" value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
