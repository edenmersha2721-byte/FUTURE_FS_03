import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, CalendarX } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import { businessHoursApi } from '../../api/endpoints.js';
import { formatDate } from '../../utils/format.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hhmm = (t) => String(t || '').slice(0, 5);

export default function AdminHours() {
  const [hours, setHours] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newClosed, setNewClosed] = useState({ date: '', reason: '' });

  const load = () => {
    setLoading(true);
    businessHoursApi.schedule()
      .then((res) => {
        const data = res.data.data || {};
        const rows = (data.hours || []).map((h) => ({
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: hhmm(h.open_time),
          close_time: hhmm(h.close_time),
        }));
        setHours(rows);
        setClosedDates(data.closedDates || []);
      })
      .catch(() => toast.error('Could not load business hours'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateRow = (dow, patch) =>
    setHours((prev) => prev.map((h) => (h.day_of_week === dow ? { ...h, ...patch } : h)));

  const saveHours = async () => {
    // Basic client-side sanity check
    for (const h of hours) {
      if (h.is_open && h.open_time >= h.close_time) {
        return toast.error(`${DAY_NAMES[h.day_of_week]}: closing must be after opening`);
      }
    }
    setSaving(true);
    try {
      await businessHoursApi.updateHours(hours);
      toast.success('Business hours saved');
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addClosed = async (e) => {
    e.preventDefault();
    if (!newClosed.date) return toast.error('Pick a date to close');
    try {
      await businessHoursApi.addClosedDate(newClosed);
      toast.success('Closed date added');
      setNewClosed({ date: '', reason: '' });
      load();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not add closed date');
    }
  };

  const removeClosed = async (id) => {
    try {
      await businessHoursApi.removeClosedDate(id);
      toast.success('Closed date removed');
      setClosedDates((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not remove');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly hours */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-cream">Weekly Hours</h2>
          <button onClick={saveHours} disabled={saving} className="btn-gold">
            <Save size={16} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Set the opening and closing time for each day. Turn a day off to close it entirely.</p>

        <div className="mt-5 space-y-2">
          {hours.map((h) => (
            <div key={h.day_of_week} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
              <label className="flex w-32 items-center gap-2 text-sm font-medium text-cream">
                <input
                  type="checkbox"
                  checked={h.is_open}
                  onChange={(e) => updateRow(h.day_of_week, { is_open: e.target.checked })}
                />
                {DAY_NAMES[h.day_of_week]}
              </label>
              {h.is_open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    className="input w-32 py-1.5"
                    value={h.open_time}
                    onChange={(e) => updateRow(h.day_of_week, { open_time: e.target.value })}
                  />
                  <span className="text-muted">to</span>
                  <input
                    type="time"
                    className="input w-32 py-1.5"
                    value={h.close_time}
                    onChange={(e) => updateRow(h.day_of_week, { close_time: e.target.value })}
                  />
                </div>
              ) : (
                <span className="text-sm text-sand">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Closed dates / holidays */}
      <div className="card p-6">
        <h2 className="font-serif text-2xl text-cream">Closed Dates &amp; Holidays</h2>
        <p className="mt-1 text-sm text-muted">Block specific dates (e.g. holidays). These override the weekly hours.</p>

        <form onSubmit={addClosed} className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input py-1.5"
              value={newClosed.date}
              onChange={(e) => setNewClosed((c) => ({ ...c, date: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="label">Reason (optional)</label>
            <input
              className="input py-1.5"
              placeholder="e.g. Public holiday"
              value={newClosed.reason}
              onChange={(e) => setNewClosed((c) => ({ ...c, reason: e.target.value }))}
            />
          </div>
          <button className="btn-gold shrink-0"><Plus size={16} /> Add</button>
        </form>

        <div className="mt-5 space-y-2">
          {closedDates.length === 0 ? (
            <p className="rounded-xl border border-line bg-white/[0.02] px-4 py-6 text-center text-sm text-muted">
              No closed dates yet.
            </p>
          ) : (
            closedDates.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-line bg-white/[0.02] px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-cream">
                  <CalendarX size={16} className="text-rose-300" />
                  {formatDate(c.date)}
                  {c.reason && <span className="text-muted">— {c.reason}</span>}
                </span>
                <button onClick={() => removeClosed(c.id)} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
