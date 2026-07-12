import { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, Scissors, Flower2, Hand, Sparkles, Brush, Droplets, Leaf,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import ServiceCard from '../common/ServiceCard.jsx';
import Reveal from '../common/Reveal.jsx';
import Loader from '../common/Loader.jsx';
import { serviceApi, categoryApi } from '../../api/endpoints.js';

const CAT_ICON = {
  all: LayoutGrid,
  hair: Scissors,
  spa: Flower2,
  massage: Hand,
  facial: Sparkles,
  nails: Brush,
  makeup: Brush,
  waxing: Droplets,
  'skin-care': Leaf,
};

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([serviceApi.list({ active: 'true' }), categoryApi.list({ active: 'true' })])
      .then(([svc, cat]) => {
        setServices(svc.data.data);
        setCategories(cat.data.data.filter((c) => Number(c.service_count) > 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const list = active === 'all' ? services : services.filter((s) => s.category_slug === active);
    return list.slice(0, 6);
  }, [services, active]);

  const tabs = [{ slug: 'all', name: 'All Services' }, ...categories];

  return (
    <section id="services" className="relative flex min-h-screen items-center overflow-hidden bg-ink py-24">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="container-lux relative w-full">
        <SectionHeading
          eyebrow="Our Premium Services"
          title="Explore Our Services"
          subtitle="A curated range of premium beauty and wellness services, designed just for you."
        />

        {/* Category selector — icon tiles */}
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {tabs.map((c) => {
            const Icon = CAT_ICON[c.slug] || Sparkles;
            const isActive = active === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`group flex w-24 flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all duration-300 ${
                  isActive
                    ? 'border-gold/70 bg-gold/10 shadow-gold'
                    : 'border-line bg-panel hover:border-gold/40 hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    isActive ? 'text-gold' : 'text-cream/60 group-hover:text-gold'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-gold' : 'text-cream/70'}`}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </Reveal>

        {loading ? (
          <Loader label="Loading services…" />
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
