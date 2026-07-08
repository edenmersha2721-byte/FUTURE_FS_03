import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { authApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CustomerProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-gradient font-serif text-3xl font-bold text-charcoal">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif text-2xl text-charcoal">{user?.name}</h3>
            <p className="text-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input bg-beige/40" value={user?.email} readOnly />
          </div>
          <button disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save Changes'} <Save size={16} /></button>
        </form>
      </div>
    </div>
  );
}
