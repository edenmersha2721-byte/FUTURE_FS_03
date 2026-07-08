import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, CalendarCheck } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { label: 'Home', to: '#home' },
  { label: 'Services', to: '#services' },
  { label: 'About', to: '#about' },
  { label: 'Gallery', to: '#gallery' },
  { label: 'Offers', to: '#offers' },
  { label: 'Reviews', to: '#reviews' },
  { label: 'Contact', to: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-charcoal/95 backdrop-blur shadow-lg py-2.5' : 'bg-charcoal/80 backdrop-blur-sm py-4'
      }`}
    >
      <nav className="container-lux flex items-center justify-between">
        <Link to="/#home"><Logo /></Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <a
                href={`/${l.to}`}
                className="text-sm font-medium tracking-wide text-cream/90 transition hover:text-gold"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-ghost text-cream hover:bg-white/10">
                <LayoutDashboard size={16} /> {isAdmin ? 'Admin' : 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="btn-outline border-gold/50 text-cream hover:bg-white/10">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-cream/90 transition hover:text-gold">
              Login
            </Link>
          )}
          <Link to="/book" className="btn-gold">
            <CalendarCheck size={16} /> Book Appointment
          </Link>
        </div>

        <button
          className="text-cream lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-charcoal lg:hidden">
          <ul className="container-lux flex flex-col gap-1 py-4">
            {links.map((l) => (
              <li key={l.to}>
                <a
                  href={`/${l.to}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-cream/90 hover:bg-white/10"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2 px-1">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setOpen(false)} className="btn-outline border-gold/50 text-cream">
                    {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-cream hover:bg-white/10">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline border-gold/50 text-cream">
                  Login
                </Link>
              )}
              <Link to="/book" onClick={() => setOpen(false)} className="btn-gold">Book Appointment</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
