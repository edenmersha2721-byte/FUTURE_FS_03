import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Trash2, Phone } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { contactApi } from '../../api/endpoints.js';
import { formatDate } from '../../utils/format.js';

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    contactApi.list().then((r) => setItems(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (id) => { await contactApi.markRead(id); load(); };
  const remove = async (id) => {
    if (!confirm('Delete this message?')) return;
    await contactApi.remove(id);
    toast.success('Message deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {items.length === 0 && <div className="card py-16 text-center text-muted">No messages yet.</div>}
      {items.map((m) => (
        <div key={m.id} className={`card p-5 ${!m.is_read ? 'border-l-4 border-gold' : ''}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-charcoal">{m.name}</p>
                {!m.is_read && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold-dark">New</span>}
              </div>
              <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1"><Mail size={12} /> {m.email}</span>
                {m.phone && <span className="flex items-center gap-1"><Phone size={12} /> {m.phone}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">{formatDate(m.created_at)}</span>
              {!m.is_read && <button onClick={() => markRead(m.id)} title="Mark read" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><MailOpen size={16} /></button>}
              <button onClick={() => remove(m.id)} title="Delete" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
            </div>
          </div>
          {m.subject && <p className="mt-3 font-medium text-espresso">{m.subject}</p>}
          <p className="mt-1 text-sm text-muted">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
