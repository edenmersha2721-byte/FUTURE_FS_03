import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { currency, duration } from '../../utils/format.js';
import { assetUrl } from '../../api/client.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';

export default function ServiceCard({ service }) {
  return (
    <div className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-gold">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={assetUrl(service.image_url) || FALLBACK_IMG}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-500 [transform:scale(var(--z))] group-hover:[transform:scale(calc(var(--z)*1.08))]"
          style={{
            objectPosition: `50% ${service.image_pos_y ?? 50}%`,
            '--z': Number(service.image_zoom) || 1,
          }}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        {service.category_name && (
          <span className="absolute left-3 top-3 rounded-full bg-charcoal/70 px-3 py-1 text-xs font-medium text-cream backdrop-blur">
            {service.category_name}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-cream">{service.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Clock size={15} className="text-gold" /> {duration(service.duration_minutes)}
          </span>
          <span className="gold-text font-serif text-2xl font-semibold">{currency(service.price)}</span>
        </div>
        <Link
          to={`/book?service=${service.id}`}
          className="btn-gold mt-4 w-full"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
