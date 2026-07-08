import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Phone, MessageCircle, MapPin, Sparkles } from 'lucide-react';

const slides = [
  {
    img: '/homepage image.png',
    tagline: 'Feel Beautiful, Feel You',
    title: ['Where Beauty', 'Meets ', 'Excellence'],
    text: 'Experience premium beauty and wellness services designed to bring out your best.',
  },
  {
    img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80',
    tagline: 'Indulge & Unwind',
    title: ['Luxury Care', 'For ', 'Every You'],
    text: 'From radiant hair to soothing spa rituals — crafted by expert hands.',
  },
  {
    img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1600&q=80',
    tagline: 'Relax. Refresh. Renew.',
    title: ['Your Sanctuary', 'Of ', 'Beauty'],
    text: 'Step into a world of elegance, comfort and personalized attention.',
  },
];

const sideActions = [
  { icon: Phone, label: 'Call Us', href: 'tel:+15551234567' },
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/15551234567' },
  { icon: MapPin, label: 'Location', href: '#contact' },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-charcoal">
      {/* Background image crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <img src={slide.img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-hero-fade" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container-lux relative z-10 pt-24">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-script text-2xl text-gold-light md:text-3xl">{slide.tagline}</p>
              <h1 className="mt-3 font-serif text-5xl font-semibold leading-[1.05] text-cream md:text-7xl">
                {slide.title[0]}
                <br />
                {slide.title[1]}
                <span className="text-gold">{slide.title[2]}</span>
              </h1>
              <div className="mt-6 h-px w-24 bg-gold/70" />
              <p className="mt-6 max-w-lg text-lg text-cream/80">{slide.text}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/book" className="btn-gold text-base">
              <CalendarCheck size={18} /> Book Appointment
            </Link>
            <a href="#services" className="btn-outline border-cream/40 text-cream hover:bg-white/10">
              Explore Services
            </a>
          </div>

          {/* Slide dots */}
          <div className="mt-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-gold' : 'w-2 bg-cream/40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating side actions */}
      <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-4 md:flex">
        {sideActions.map((a) => (
          <a
            key={a.label}
            href={a.href}
            className="group flex flex-col items-center gap-1 text-cream/80 hover:text-gold"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-charcoal/40 backdrop-blur transition group-hover:border-gold group-hover:bg-gold group-hover:text-charcoal">
              <a.icon size={18} />
            </span>
            <span className="text-[0.65rem] font-medium">{a.label}</span>
          </a>
        ))}
      </div>

      <Sparkles className="absolute bottom-24 right-24 hidden text-gold/60 lg:block animate-float" size={28} />
    </section>
  );
}
