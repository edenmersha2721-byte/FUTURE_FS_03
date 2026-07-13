import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, ImageIcon, Send } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import ImageInput from '../common/ImageInput.jsx';
import { inspirationApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { todayISO } from '../../utils/format.js';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

const emptyForm = { name: '', email: '', phone: '', note: '', imageUrl: '', posY: 50, zoom: 1, date: '', time: '' };

export default function InspirationCTA() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((s) => ({ ...s, ...patch }));

  const openModal = () => {
    setForm({ ...emptyForm, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('Please enter your name and email');
    if (!form.date || !form.time) return toast.error('Please pick a preferred date and time');
    if (!form.imageUrl.trim()) return toast.error('Please add an inspiration photo');
    setSaving(true);
    try {
      await inspirationApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        note: form.note.trim() || undefined,
        image_url: form.imageUrl.trim(),
        image_pos_y: form.posY,
        image_zoom: form.zoom,
        preferred_date: form.date,
        preferred_time: form.time,
      });
      toast.success('Request sent! The salon will review your inspiration and confirm your appointment.');
      setOpen(false);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not send your request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mt-14 overflow-hidden rounded-3xl border border-gold/20 bg-panel-glow bg-panel p-8 text-center md:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <Sparkles size={22} />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-cream md:text-3xl">
          Can’t find the look you want?
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Book with an inspiration photo instead. Pick a date and time, attach the style you have in mind,
          and the salon will review and confirm your appointment — even if it’s not in our list yet.
        </p>
        <button onClick={openModal} className="btn-gold mx-auto mt-6">
          <ImageIcon size={16} /> Book with an Inspiration
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Book with an Inspiration" size="lg">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Your Name</label>
            <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set({ email: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Phone (optional)</label>
            <input className="input" placeholder="e.g. 0910 98 5642" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Preferred Date</label>
            <input type="date" min={todayISO()} className="input" value={form.date} onChange={(e) => set({ date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Preferred Time</label>
            <select className="input" value={form.time} onChange={(e) => set({ time: e.target.value })} required>
              <option value="">Select a time…</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">What look are you after? (optional)</label>
            <textarea rows={2} className="input resize-none" placeholder="Describe the style, occasion, colors…" value={form.note} onChange={(e) => set({ note: e.target.value })} />
          </div>

          <div className="sm:col-span-2">
            <ImageInput
              label="Inspiration Photo"
              value={form.imageUrl}
              onChange={(url) => set({ imageUrl: url })}
              posY={form.posY}
              onPosYChange={(v) => set({ posY: v })}
              zoom={form.zoom}
              onZoomChange={(v) => set({ zoom: v })}
              endpoint="/upload/public"
            />
          </div>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button disabled={saving} className="btn-gold">{saving ? 'Sending…' : 'Request Appointment'} <Send size={15} /></button>
          </div>
        </form>
      </Modal>
    </>
  );
}
