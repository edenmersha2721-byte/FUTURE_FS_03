export default function Logo({ dark = false, className = '' }) {
  const text = dark ? 'text-charcoal' : 'text-cream';
  const sub = dark ? 'text-muted' : 'text-gold-light';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden>
        <path d="M32 8c5 10 15 12 15 22a15 15 0 0 1-30 0c0-10 10-12 15-22z" fill="#C9A15A" />
        <path d="M32 18c2.5 6 8.5 7.5 8.5 13.5a8.5 8.5 0 0 1-17 0C23.5 25.5 29.5 24 32 18z" fill="#E8C99B" />
      </svg>
      <div className="leading-none">
        <div className={`font-serif text-xl font-semibold tracking-wide ${text}`}>LUXE SALON</div>
        <div className={`text-[0.6rem] font-medium uppercase tracking-[0.35em] ${sub}`}>Beauty &amp; Spa</div>
      </div>
    </div>
  );
}
