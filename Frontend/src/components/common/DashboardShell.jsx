import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home } from 'lucide-react';
import Logo from './Logo.jsx';
import NotificationBell from './NotificationBell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardShell({ title, nav, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <Link to="/"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gold-gradient text-charcoal' : 'text-cream/70 hover:bg-white/10 hover:text-cream'
              }`
            }
          >
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-cream/70 hover:bg-white/10">
          <Home size={18} /> Back to Website
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-rose-300 hover:bg-white/10">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-charcoal lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-charcoal">
            <button className="absolute right-3 top-4 text-cream" onClick={() => setOpen(false)}><X /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink/85 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="text-cream lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
            <h1 className="font-serif text-2xl font-semibold text-cream">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-medium text-cream">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-serif text-lg font-bold text-charcoal">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
