import { motion } from 'framer-motion';
import { Users, Award, Clock3, Star } from 'lucide-react';
import Reveal from '../common/Reveal.jsx';

const stats = [
  { icon: Users, value: '5000+', label: 'Happy Clients' },
  { icon: Award, value: '20+', label: 'Expert Stylists' },
  { icon: Clock3, value: '10+', label: 'Years of Experience' },
  { icon: Star, value: '4.9/5', label: 'Client Rating' },
];

export default function AboutSection() {
  return (
    <section id="about" className="flex min-h-screen flex-col justify-center bg-ivory py-24">
      <div className="container-lux grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&q=80"
              alt="Luxe salon interior"
              className="rounded-3xl object-cover shadow-soft"
            />
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-gold-gradient px-6 py-5 text-charcoal shadow-gold sm:block">
              <p className="font-serif text-3xl font-bold">10+</p>
              <p className="text-xs font-medium uppercase tracking-widest">Years of Excellence</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="eyebrow">Our Story</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-charcoal md:text-5xl">
            Passion. Care. Excellence.
          </h2>
          <p className="mt-6 leading-relaxed text-muted">
            Luxe Salon was founded with a simple mission — to provide premium beauty and wellness services
            in a relaxing and welcoming environment. We believe beauty is more than skin deep.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Our team of experienced professionals is dedicated to helping you look and feel your best with
            personalized care and the highest quality products.
          </p>
          <p className="mt-6 font-script text-2xl text-gold-dark">Because you deserve to feel beautiful.</p>
        </Reveal>
      </div>

      {/* Stats bar */}
      <div className="container-lux mt-16">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-beige/70 p-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <s.icon className="text-gold-dark" size={30} />
              <p className="font-serif text-3xl font-bold text-charcoal md:text-4xl">{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
