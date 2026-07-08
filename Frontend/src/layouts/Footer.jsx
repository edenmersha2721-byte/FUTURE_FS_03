import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Leaf, ShieldCheck, Heart, Smile } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';

const features = [
  { icon: Leaf, title: 'Premium Products', text: 'We use only high-quality, trusted products.' },
  { icon: ShieldCheck, title: 'Hygiene & Safety', text: 'Your safety and comfort are our top priority.' },
  { icon: Heart, title: 'Personalized Care', text: 'Every service is tailored to your unique needs.' },
  { icon: Smile, title: 'Relaxing Environment', text: 'Enjoy a peaceful and luxurious salon experience.' },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Feature strip */}
      <div className="border-b border-white/10">
        <div className="container-lux grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                <f.icon size={20} />
              </div>
              <div>
                <h4 className="font-serif text-lg text-cream">{f.title}</h4>
                <p className="text-sm text-cream/60">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="container-lux grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            Where beauty meets excellence. Premium beauty and wellness services designed to bring out your best.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream transition hover:bg-gold hover:text-charcoal">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-4 font-serif text-lg">Quick Links</h5>
          <ul className="space-y-2.5 text-sm text-cream/60">
            {['Home', 'Services', 'About', 'Gallery', 'Contact'].map((l) => (
              <li key={l}>
                <a href={`/#${l.toLowerCase()}`} className="transition hover:text-gold">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-4 font-serif text-lg">Services</h5>
          <ul className="space-y-2.5 text-sm text-cream/60">
            {['Hair Styling', 'Spa & Massage', 'Facials', 'Nails', 'Makeup'].map((l) => (
              <li key={l}><a href="/#services" className="transition hover:text-gold">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-4 font-serif text-lg">Get In Touch</h5>
          <ul className="space-y-2.5 text-sm text-cream/60">
            <li>4 Kilo, Bashawelde Condominium</li>
            <li>Addis Ababa, Ethiopia</li>
            <li>+1 (555) 123-4567</li>
            <li>info@luxesalon.com</li>
            <li>Mon – Sat: 9:00 AM – 8:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-sm text-cream/50 md:flex-row">
          <p>© 2026 Luxe Salon. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-gold">Privacy Policy</Link>
            <Link to="/" className="hover:text-gold">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
