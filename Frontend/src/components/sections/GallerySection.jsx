import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from '../common/SectionHeading.jsx';
import { galleryApi } from '../../api/endpoints.js';
import { assetUrl } from '../../api/client.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';

export default function GallerySection() {
  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    galleryApi.list().then((res) => setItems(res.data.data)).catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <section id="gallery" className="flex min-h-screen flex-col justify-center bg-cream py-24">
      <div className="container-lux w-full">
        <SectionHeading
          eyebrow="Portfolio"
          title="Our Gallery"
          subtitle="Moments of beauty, confidence and transformation. Explore our work and the experience we create for every client."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => setLightbox(item)}
              className="group relative aspect-square overflow-hidden rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.05 }}
            >
              <img
                src={assetUrl(item.image_url)}
                alt={item.title || 'Gallery'}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG;
                }}
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/70 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <span className="font-serif text-lg text-cream">{item.title}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={assetUrl(lightbox.image_url)}
              alt={lightbox.title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
