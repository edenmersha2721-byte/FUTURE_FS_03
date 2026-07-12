import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Clock, CalendarCheck, CheckCircle2, Info,
} from 'lucide-react';
import Navbar from '../layouts/Navbar.jsx';
import Loader from '../components/common/Loader.jsx';
import { serviceApi, categoryApi, appointmentApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currency, duration, formatDate, formatTime, todayISO } from '../utils/format.js';
import { assetUrl } from '../api/client.js';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function iso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function Calendar({ selected, onSelect }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = todayISO();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }))} className="rounded-full p-2 hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <p className="font-serif text-lg font-semibold">
          {first.toLocaleString('en-US', { month: 'long' })} {view.y}
        </p>
        <button onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }))} className="rounded-full p-2 hover:bg-white/5">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {DOW.map((d) => <span key={d} className="py-1 font-medium">{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const dateStr = iso(view.y, view.m, d);
          const past = dateStr < today;
          const isSel = dateStr === selected;
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-full text-sm transition ${
                isSel ? 'bg-gold-gradient font-semibold text-charcoal'
                : past ? 'cursor-not-allowed text-sand'
                : dateStr === today ? 'bg-white/5 font-medium hover:bg-gold/30'
                : 'hover:bg-white/5'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guest details (used only when not logged in)
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    Promise.all([categoryApi.list({ active: 'true' }), serviceApi.list({ active: 'true' })])
      .then(([cat, svc]) => {
        const cats = cat.data.data.filter((c) => Number(c.service_count) > 0);
        setCategories(cats);
        setServices(svc.data.data);

        const preId = Number(params.get('service'));
        const pre = svc.data.data.find((s) => s.id === preId);
        if (pre) {
          setSelectedService(pre);
          setActiveCat(pre.category_id);
        } else if (cats[0]) {
          setActiveCat(cats[0].id);
        }
      })
      .catch(() => toast.error('Could not load services'))
      .finally(() => setLoading(false));
  }, [params]);

  const catServices = useMemo(
    () => services.filter((s) => s.category_id === activeCat),
    [services, activeCat]
  );

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim());
  const guestValid = user || (guest.name.trim() && guest.phone.trim() && emailValid);
  const canBook = selectedService && date && time && guestValid;

  const submit = async () => {
    if (!selectedService || !date || !time) {
      return toast.error('Please select a service, date and time');
    }
    if (!user && !guestValid) {
      return toast.error('Please fill in your name, a valid email and phone number');
    }
    setSubmitting(true);
    try {
      const payload = {
        service_id: selectedService.id,
        appointment_date: date,
        appointment_time: time,
        notes,
      };
      if (!user) {
        payload.guest_name = guest.name.trim();
        payload.guest_email = guest.email.trim();
        payload.guest_phone = guest.phone.trim();
      }
      await appointmentApi.create(payload);
      toast.success('Appointment booked! Status: Pending confirmation.');
      navigate(user ? '/dashboard/appointments' : '/');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      {/* Hero */}
      <div className="relative bg-charcoal pb-14 pt-32">
        <div className="container-lux text-cream">
          <p className="text-sm text-cream/60">
            <Link to="/" className="hover:text-gold">Home</Link> › Book Appointment
          </p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Book Appointment</h1>
          <p className="mt-2 text-cream/70">Choose your preferred service, date and time.</p>
        </div>
      </div>

      {loading ? (
        <Loader full />
      ) : (
        <div className="container-lux grid gap-6 py-10 lg:grid-cols-2">
          {/* Step 1: Service */}
          <div className="card p-6">
            <h2 className="font-serif text-2xl">1. Select a Service</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    activeCat === c.id ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line hover:border-gold'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-4 max-h-[380px] space-y-2 overflow-auto pr-1">
              {catServices.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selectedService?.id === s.id ? 'border-gold bg-gold/10' : 'border-line hover:border-gold/60'
                  }`}
                >
                  <img src={assetUrl(s.image_url)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="flex-1">
                    <span className="block font-medium text-cream">{s.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {duration(s.duration_minutes)}</span>
                  </span>
                  <span className="font-serif text-lg font-semibold text-gold">{currency(s.price)}</span>
                </button>
              ))}
            </div>

            {selectedService && (
              <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-cream/80"><Info size={15} /> Service Details</p>
                <p className="mt-1 text-sm text-muted">{selectedService.description}</p>
              </div>
            )}
          </div>

          {/* Step 2: Date & Time */}
          <div className="card p-6">
            <h2 className="font-serif text-2xl">2. Select Date &amp; Time</h2>
            <div className="mt-4">
              <Calendar selected={date} onSelect={(d) => setDate(d)} />
            </div>
            <p className="mt-5 text-sm font-medium text-cream/80">Available Time Slots</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`rounded-lg border py-2 text-sm transition ${
                    time === t ? 'border-gold bg-gold-gradient font-semibold text-charcoal' : 'border-line hover:border-gold'
                  }`}
                >
                  {formatTime(t)}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Details */}
          <div className="card p-6">
            <h2 className="font-serif text-2xl">3. Your Details</h2>

            {!user && (
              <p className="mt-3 rounded-xl border border-gold/25 bg-gold/10 px-4 py-2.5 text-sm text-cream/80">
                Booking as a guest — just fill in your details below.{' '}
                <Link to="/login" className="font-medium text-gold hover:underline">Log in</Link>{' '}
                if you'd like to track your appointments.
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input
                  className={`input ${user ? 'bg-white/[0.04]' : ''}`}
                  placeholder="Your full name"
                  value={user ? (user.name || '') : guest.name}
                  onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
                  readOnly={!!user}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className={`input ${user ? 'bg-white/[0.04]' : ''}`}
                  placeholder="e.g. 0910 98 5642"
                  value={user ? (user.phone || '—') : guest.phone}
                  onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                  readOnly={!!user}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  className={`input ${user ? 'bg-white/[0.04]' : ''}`}
                  placeholder="you@example.com"
                  value={user ? (user.email || '') : guest.email}
                  onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                  readOnly={!!user}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Special Request (Optional)</label>
                <textarea rows={3} className="input resize-none" placeholder="Any special request or notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Step 4: Confirmation */}
          <div className="card flex flex-col p-6">
            <h2 className="font-serif text-2xl">4. Confirmation</h2>
            <div className="mt-4 space-y-3 rounded-xl bg-white/[0.03] p-5 text-sm">
              <Row label="Service" value={selectedService?.name || '—'} />
              <Row label="Date" value={date ? formatDate(date) : '—'} />
              <Row label="Time" value={time ? formatTime(time) : '—'} />
              <Row label="Duration" value={selectedService ? duration(selectedService.duration_minutes) : '—'} />
              <div className="border-t border-line pt-3">
                <Row label="Total Price" value={selectedService ? currency(selectedService.price) : '—'} bold />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                <CalendarCheck size={26} />
              </div>
              <p className="font-serif text-xl">Almost Done!</p>
              <p className="text-sm text-muted">Review your booking details and confirm your appointment.</p>
              <button onClick={submit} disabled={!canBook || submitting} className="btn-dark mt-2 w-full">
                {submitting ? 'Booking…' : 'Confirm Booking'} <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={bold ? 'font-serif text-lg font-bold text-gold' : 'font-medium text-cream'}>{value}</span>
    </div>
  );
}
