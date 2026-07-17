import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Clock, CalendarCheck, CheckCircle2, Info,
} from 'lucide-react';
import Navbar from '../layouts/Navbar.jsx';
import Loader from '../components/common/Loader.jsx';
import InspirationCTA from '../components/sections/InspirationCTA.jsx';
import { serviceApi, categoryApi, subcategoryApi, appointmentApi, businessHoursApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currency, duration, formatDate, formatTime, todayISO } from '../utils/format.js';
import { assetUrl } from '../api/client.js';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function iso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function toMin(t) {
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function Calendar({ selected, onSelect, isClosed }) {
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
          const closed = !past && isClosed?.(dateStr);
          const disabled = past || closed;
          const isSel = dateStr === selected;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              title={closed ? 'Salon closed' : undefined}
              className={`aspect-square rounded-full text-sm transition ${
                isSel ? 'bg-gold-gradient font-semibold text-charcoal'
                : past ? 'cursor-not-allowed text-sand'
                : closed ? 'cursor-not-allowed text-sand line-through'
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
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null); // subcategory id ("style"), or null for all
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [schedule, setSchedule] = useState({ hours: [], closedDates: [] });
  const [daySlots, setDaySlots] = useState([]); // bookable start times for the selected date
  const [dayClosed, setDayClosed] = useState(false);

  // Guest details (used only when not logged in)
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    Promise.all([
      categoryApi.list({ active: 'true' }),
      serviceApi.list({ active: 'true' }),
      subcategoryApi.list({ active: 'true' }),
    ])
      .then(([cat, svc, sub]) => {
        const cats = cat.data.data.filter((c) => Number(c.service_count) > 0);
        setCategories(cats);
        setServices(svc.data.data);
        setSubcategories(sub.data.data);

        // Preselect from the URL: a specific ?service=, or a ?category=/&sub= slug.
        const preId = Number(params.get('service'));
        const pre = svc.data.data.find((s) => s.id === preId);
        const catSlug = params.get('category');
        const subSlug = params.get('sub');

        if (pre) {
          // Carry the service AND its category + style so nothing is re-selected.
          setSelectedService(pre);
          setActiveCat(pre.category_id);
          setActiveSub(pre.subcategory_id || null);
        } else if (catSlug) {
          const c = cats.find((x) => x.slug === catSlug);
          if (c) {
            setActiveCat(c.id);
            const sc = sub.data.data.find((x) => x.category_id === c.id && x.slug === subSlug);
            if (sc) setActiveSub(sc.id);
          } else if (cats[0]) {
            setActiveCat(cats[0].id);
          }
        } else if (cats[0]) {
          setActiveCat(cats[0].id);
        }
      })
      .catch(() => toast.error('Could not load services'))
      .finally(() => setLoading(false));
  }, [params]);

  // Subcategories ("styles") available under the active category.
  const catSubs = useMemo(
    () => subcategories.filter((sc) => sc.category_id === activeCat),
    [subcategories, activeCat]
  );

  const catServices = useMemo(
    () => services.filter(
      (s) => s.category_id === activeCat && (!activeSub || s.subcategory_id === activeSub)
    ),
    [services, activeCat, activeSub]
  );

  // Load the salon's weekly schedule + closed dates once (to disable closed days).
  useEffect(() => {
    businessHoursApi.schedule()
      .then((res) => setSchedule(res.data.data || { hours: [], closedDates: [] }))
      .catch(() => { /* non-fatal: fall back to open calendar */ });
  }, []);

  // Is a given date closed (weekly day off or a specific holiday)?
  const closedDateSet = useMemo(
    () => new Set((schedule.closedDates || []).map((c) => c.date)),
    [schedule]
  );
  const isClosed = useMemo(() => (dateStr) => {
    if (closedDateSet.has(dateStr)) return true;
    const dow = new Date(`${dateStr}T00:00:00`).getDay();
    const h = (schedule.hours || []).find((x) => x.day_of_week === dow);
    return h ? !h.is_open : false;
  }, [closedDateSet, schedule]);

  // Whenever the date changes, load that day's bookable slots + reserved slots.
  useEffect(() => {
    if (!date) {
      setBooked([]);
      setDaySlots([]);
      setDayClosed(false);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    Promise.all([businessHoursApi.daySlots(date), appointmentApi.booked(date)])
      .then(([slotsRes, bookedRes]) => {
        if (!alive) return;
        const d = slotsRes.data.data || {};
        setDayClosed(Boolean(d.closed));
        setDaySlots(d.slots || []);
        setBooked(bookedRes.data.data || []);
      })
      .catch(() => {
        if (!alive) return;
        setDaySlots([]);
        setBooked([]);
      })
      .finally(() => { if (alive) setSlotsLoading(false); });
    return () => { alive = false; };
  }, [date]);

  // Slots that overlap a reserved appointment's [start, start+duration) range.
  const reserved = useMemo(() => {
    const set = new Set();
    for (const b of booked) {
      const start = toMin(b.time);
      const end = start + (b.duration_minutes || 60);
      for (const t of daySlots) {
        const ts = toMin(t);
        if (ts < end && start < ts + 60) set.add(t);
      }
    }
    return set;
  }, [booked, daySlots]);

  // If the chosen slot became reserved (e.g. after switching dates), clear it.
  useEffect(() => {
    if (time && reserved.has(time)) setTime('');
  }, [reserved, time]);

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
                  onClick={() => { setActiveCat(c.id); setActiveSub(null); }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    activeCat === c.id ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line hover:border-gold'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Style (subcategory) filter — appears when the category has styles */}
            {catSubs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSub(null)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    !activeSub ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line text-cream/70 hover:border-gold/40'
                  }`}
                >
                  All Styles
                </button>
                {catSubs.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveSub(sc.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      activeSub === sc.id ? 'border-gold/60 bg-gold/15 text-gold' : 'border-line text-cream/70 hover:border-gold/40'
                    }`}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            )}

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
              <Calendar selected={date} onSelect={(d) => setDate(d)} isClosed={isClosed} />
            </div>
            <p className="mt-5 text-sm font-medium text-cream/80">
              Available Time Slots
              {!date && <span className="ml-2 text-xs text-muted">— pick a date first</span>}
              {date && slotsLoading && <span className="ml-2 text-xs text-muted">— checking availability…</span>}
            </p>

            {date && !slotsLoading && dayClosed ? (
              <p className="mt-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                The salon is closed on this day. Please choose another date.
              </p>
            ) : date && !slotsLoading && daySlots.length === 0 ? (
              <p className="mt-2 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
                No time slots available for this day.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {daySlots.map((t) => {
                  const isReserved = reserved.has(t);
                  return (
                    <button
                      key={t}
                      disabled={!date || isReserved}
                      onClick={() => setTime(t)}
                      title={isReserved ? 'This time is already reserved' : undefined}
                      className={`rounded-lg border py-2 text-sm transition ${
                        isReserved
                          ? 'cursor-not-allowed border-line/60 bg-white/[0.03] text-sand line-through'
                          : time === t
                          ? 'border-gold bg-gold-gradient font-semibold text-charcoal'
                          : 'border-line hover:border-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line'
                      }`}
                    >
                      {formatTime(t)}
                      {isReserved && <span className="mt-0.5 block text-[10px] font-medium tracking-wide">Reserved</span>}
                    </button>
                  );
                })}
              </div>
            )}
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

      <div className="container-lux pb-16">
        <InspirationCTA />
      </div>
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
