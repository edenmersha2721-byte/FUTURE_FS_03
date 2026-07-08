import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { reviewApi } from '../../api/endpoints.js';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    reviewApi
      .list({ featured: 'true' })
      .then((res) => setReviews(res.data.data))
      .catch(() => {});
  }, []);

  if (!reviews.length) return null;

  return (
    <section id="reviews" className="flex min-h-screen flex-col justify-center bg-ivory py-24">
      <div className="container-lux w-full">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Clients Say"
          subtitle="Real stories from the people who trust us with their beauty."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.slice(0, 6).map((r, i) => (
            <Reveal key={r.id} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl bg-white p-8 shadow-soft">
                <Quote className="absolute right-6 top-6 text-gold/25" size={44} />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      size={16}
                      className={k < r.rating ? 'fill-gold text-gold' : 'text-sand'}
                    />
                  ))}
                </div>
                <p className="mt-4 leading-relaxed text-muted">“{r.comment}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-gradient font-serif text-lg font-bold text-charcoal">
                    {r.customer_name?.[0]?.toUpperCase() || 'G'}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{r.customer_name}</p>
                    {r.service_name && <p className="text-xs text-muted">{r.service_name}</p>}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
