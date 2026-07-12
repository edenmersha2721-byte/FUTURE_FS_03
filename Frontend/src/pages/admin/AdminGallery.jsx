import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import { galleryApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', image_url: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    galleryApi.list().then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (!file && !form.image_url) return toast.error('Provide an image file or URL');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (file) fd.append('image', file);
      await galleryApi.create(fd);
      toast.success('Image added');
      setModal(false);
      setForm({ title: '', description: '', category: '', image_url: '' });
      setFile(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this image?')) return;
    await galleryApi.remove(id);
    toast.success('Image deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="btn-gold"><Plus size={16} /> Add Image</button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="group relative aspect-square overflow-hidden rounded-2xl">
            <img src={assetUrl(g.image_url)} alt={g.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-charcoal/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <button onClick={() => remove(g.id)} className="ml-auto rounded-full bg-black/60 p-2 text-rose-300 hover:bg-black/80"><Trash2 size={15} /></button>
              <div className="text-cream">
                <p className="font-medium">{g.title}</p>
                {g.category && <p className="text-xs text-cream/70">{g.category}</p>}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full py-10 text-center text-muted">No gallery images yet.</p>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Gallery Image">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Hair, Spa, Nails…" />
          </div>
          <div>
            <label className="label">Upload Image</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted hover:border-gold">
              <Upload size={16} /> {file ? file.name : 'Choose file…'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
          <div className="text-center text-xs text-muted">— or —</div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-gold">{saving ? 'Uploading…' : 'Add Image'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
