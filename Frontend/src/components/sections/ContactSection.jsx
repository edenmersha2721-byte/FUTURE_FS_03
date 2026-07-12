import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Phone, Mail, MapPin, Clock, Send, Instagram, Facebook, Youtube,
  Navigation, Loader2, Car, ExternalLink,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { contactApi } from '../../api/endpoints.js';

// Luxe Salon — 4 Kilo, Bashawelde Condominium, Addis Ababa
const SALON_POSITION = [9.0356, 38.7638];

const pin = (fill, stroke) =>
  L.divIcon({
    className: '',
    html: `<div style="transform:translate(-50%,-100%)">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.5">
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/>
        <circle cx="12" cy="10" r="2.6" fill="${stroke}"/>
      </svg></div>`,
    iconSize: [38, 38],
  });
const goldPin = pin('#1A1613', '#C9A15A');
const userPin = pin('#1A1613', '#2563eb');

// Fits the map to show all given points whenever they change.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

const contactInfo = [
  { icon: Phone, title: 'Phone', lines: ['+1 (555) 123-4567'] },
  { icon: Mail, title: 'Email', lines: ['info@luxesalon.com'] },
  { icon: MapPin, title: 'Address', lines: ['4 Kilo, Bashawelde Condominium', 'Addis Ababa, Ethiopia'] },
  { icon: Clock, title: 'Business Hours', lines: ['Mon – Sat: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 6:00 PM'] },
];

const osmDirectionsUrl = (from) => {
  const base = 'https://www.openstreetmap.org/directions';
  const to = `${SALON_POSITION[0]},${SALON_POSITION[1]}`;
  const fromParam = from ? `${from[0]},${from[1]}` : '';
  return `${base}?engine=fossgis_osrm_car&route=${fromParam};${to}`;
};

export default function ContactSection() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Routing state
  const [userPos, setUserPos] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routing, setRouting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactApi.send(data);
      toast.success('Message sent — we’ll be in touch soon!');
      reset();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Could not send message');
    } finally {
      setSubmitting(false);
    }
  };

  const getDirections = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setRouting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const from = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(from);
        try {
          // OSRM public routing (OpenStreetMap based). coords are lon,lat order.
          const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${from[1]},${from[0]};${SALON_POSITION[1]},${SALON_POSITION[0]}` +
            `?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (!data.routes || !data.routes.length) throw new Error('No route found');
          const line = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          setRoute(line);
          setRouteInfo({
            distanceKm: (data.routes[0].distance / 1000).toFixed(1),
            durationMin: Math.round(data.routes[0].duration / 60),
          });
          toast.success('Route to the salon is ready!');
        } catch (e) {
          toast.error('Could not calculate the route. Try the "Open in OpenStreetMap" link.');
        } finally {
          setRouting(false);
        }
      },
      () => {
        setRouting(false);
        toast.error('Location access denied. Please allow location to get directions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section id="contact" className="flex min-h-screen flex-col justify-center bg-cream py-24">
      <div className="container-lux w-full">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Contact Us"
          subtitle="We’d love to hear from you! Reach out for appointments, inquiries or any assistance."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Info */}
          <Reveal className="space-y-6">
            {contactInfo.map((c) => (
              <div key={c.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                  <c.icon size={19} />
                </span>
                <div>
                  <p className="font-semibold text-charcoal">{c.title}</p>
                  {c.lines.map((l) => (
                    <p key={l} className="text-sm text-muted">{l}</p>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm font-medium text-charcoal">Follow Us</span>
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-cream transition hover:bg-gold hover:text-charcoal">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <h3 className="font-serif text-2xl text-charcoal">Send Us a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input className="input" placeholder="Your Name" {...register('name', { required: 'Name is required' })} />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    className="input"
                    placeholder="Your Email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                </div>
                <input className="input sm:col-span-2" placeholder="Phone Number" {...register('phone')} />
                <input className="input sm:col-span-2" placeholder="Subject" {...register('subject')} />
                <div className="sm:col-span-2">
                  <textarea
                    rows={4}
                    className="input resize-none"
                    placeholder="Your Message"
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message.message}</p>}
                </div>
                <button disabled={submitting} className="btn-dark sm:col-span-2 sm:w-max">
                  {submitting ? 'Sending…' : 'Send Message'} <Send size={16} />
                </button>
              </form>

              {/* Directions bar */}
              <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-beige/50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm text-espresso">
                  <MapPin size={16} className="text-gold-dark" />
                  {routeInfo ? (
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium"><Car size={15} /> {routeInfo.distanceKm} km</span>
                      <span className="text-muted">≈ {routeInfo.durationMin} min drive</span>
                    </span>
                  ) : (
                    <span>Find your way to Luxe Salon</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={getDirections} disabled={routing} className="btn-gold text-sm">
                    {routing ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
                    {routing ? 'Locating…' : 'Get Directions'}
                  </button>
                  <a
                    href={osmDirectionsUrl(userPos)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline text-sm"
                    title="Open in OpenStreetMap"
                  >
                    <ExternalLink size={15} /> Open Map
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-sand">
                <MapContainer center={SALON_POSITION} zoom={15} className="h-full w-full" scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={SALON_POSITION} icon={goldPin}>
                    <Popup>Luxe Salon<br />4 Kilo, Bashawelde Condominium</Popup>
                  </Marker>
                  {userPos && (
                    <Marker position={userPos} icon={userPin}>
                      <Popup>Your location</Popup>
                    </Marker>
                  )}
                  {route && <Polyline positions={route} pathOptions={{ color: '#C9A15A', weight: 5, opacity: 0.9 }} />}
                  {route && <FitBounds points={route} />}
                </MapContainer>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
