import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <Reveal className={center ? 'text-center' : ''}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="section-title text-cream">{title}</h2>
      <div className={`mt-4 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
        <span className="h-px w-10 bg-gold" />
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold"><path fill="currentColor" d="M12 3c1.8 3.6 5.4 4.3 5.4 7.9A5.4 5.4 0 0 1 6.6 10.9C6.6 7.3 10.2 6.6 12 3z"/></svg>
        <span className="h-px w-10 bg-gold" />
      </div>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
