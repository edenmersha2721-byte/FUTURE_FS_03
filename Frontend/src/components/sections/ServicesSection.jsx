import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../common/SectionHeading.jsx';
import ServiceCard from '../common/ServiceCard.jsx';
import Reveal from '../common/Reveal.jsx';
import Loader from '../common/Loader.jsx';
import { serviceApi, categoryApi } from '../../api/endpoints.js';

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

  return (
    <section id="services" className="flex min-h-screen items-center bg-cream py-24">
      <div className="container-lux w-full">
        <SectionHeading
          eyebrow="Our Services"
          title="Beauty That Inspires Confidence"
          subtitle="Explore our wide range of premium beauty and wellness services designed just for you."
        />

        {/* Category tabs */}
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                active === c.slug
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand bg-white text-charcoal hover:border-gold'
              }`}
            >
              {c.name}
            </button>
          ))}
        </Reveal>

        {loading ? (
          <Loader label="Loading services…" />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
