import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo.jsx';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80"
          alt="Amra Beauty"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-cream">
          <Link to="/"><Logo /></Link>
          <div>
            <p className="font-script text-3xl text-gold-light">Feel Beautiful, Feel You</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Where Beauty Meets Excellence</h2>
            <p className="mt-3 max-w-md text-cream/70">
              Join thousands of clients who trust Amra Beauty for premium beauty and wellness.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-ink px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>
          <h1 className="font-serif text-4xl font-semibold text-cream">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          <Link to="/" className="mt-6 block text-center text-sm text-gold hover:underline">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
