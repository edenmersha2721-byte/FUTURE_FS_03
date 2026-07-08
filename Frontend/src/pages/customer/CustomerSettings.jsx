import { useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { authApi } from '../../api/endpoints.js';

export default function CustomerSettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="card p-6 md:p-8">
        <h3 className="flex items-center gap-2 font-serif text-2xl"><KeyRound size={20} /> Change Password</h3>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
          </div>
          <button disabled={saving} className="btn-gold">{saving ? 'Updating…' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
