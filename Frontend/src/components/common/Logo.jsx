export default function Logo({ dark = false, className = '' }) {
  const text = dark ? 'text-cream' : 'text-cream';
  const sub = dark ? 'text-muted' : 'text-gold-light';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.jpg"
        alt="Amra Beauty"
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
      <div className="leading-none">
        <div className={`font-serif text-xl font-semibold tracking-wide ${text}`}>AMRA BEAUTY</div>
        <div className={`text-[0.6rem] font-medium uppercase tracking-[0.35em] ${sub}`}>Beauty Salon</div>
      </div>
    </div>
  );
}
