import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { promotionApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

export default function PromotionsSection() {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    promotionApi.list({ active: 'true' }).then((res) => setPromos(res.data.data)).catch(() => {});
  }, []);

  if (!promos.length) return null;

  return (
    <section id="offers" className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-charcoal py-24 text-cream">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-lux relative w-full">
        <SectionHeading
          light
          eyebrow="Special Offers"
          title="Seasonal Promotions"
          subtitle="Treat yourself to our exclusive packages and limited-time discounts."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {promos.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-cocoa/60 backdrop-blur">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={assetUrl(p.image_url) || 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80'}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold-gradient px-3 py-1 text-sm font-bold text-charcoal">
                    <Tag size={13} />
                    {p.discount_type === 'percentage' ? `${p.discount}% OFF` : `$${p.discount} OFF`}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl text-cream">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{p.description}</p>
                  {p.end_date && (
                    <p className="mt-3 text-xs uppercase tracking-widest text-gold-light">
                      Valid until {formatDate(p.end_date)}
                    </p>
                  )}
                  <Link to="/book" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold transition hover:gap-3">
                    Claim Offer <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
