import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import HeroSection from '../components/sections/HeroSection.jsx';
import ServicesSection from '../components/sections/ServicesSection.jsx';
import AboutSection from '../components/sections/AboutSection.jsx';
import PromotionsSection from '../components/sections/PromotionsSection.jsx';
import GallerySection from '../components/sections/GallerySection.jsx';
import TestimonialsSection from '../components/sections/TestimonialsSection.jsx';
import ContactSection from '../components/sections/ContactSection.jsx';
import Reveal from '../components/common/Reveal.jsx';

function CtaBanner() {
  return (
    <section className="bg-ivory pb-24">
      <div className="container-lux">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gold-gradient px-8 py-12 text-center shadow-gold md:flex-row md:text-left">
            <div>
              <h3 className="font-serif text-3xl font-semibold text-charcoal md:text-4xl">
                Ready to experience the Luxe difference?
              </h3>
              <p className="mt-2 text-charcoal/80">
                Book your appointment today and let us bring out the best in you.
              </p>
            </div>
            <Link to="/book" className="btn-dark whitespace-nowrap text-base">
              <CalendarCheck size={18} /> Book Appointment
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PromotionsSection />
      <GallerySection />
      <TestimonialsSection />
      <CtaBanner />
      <ContactSection />
    </>
  );
}
