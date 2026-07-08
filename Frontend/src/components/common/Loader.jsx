export default function Loader({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'min-h-[60vh]' : 'py-16'}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sand border-t-gold" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
