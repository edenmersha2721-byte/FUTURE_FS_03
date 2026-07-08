import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Star, User, Settings } from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell.jsx';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/appointments', label: 'My Appointments', icon: CalendarDays },
  { to: '/dashboard/reviews', label: 'My Reviews', icon: Star },
  { to: '/dashboard/profile', label: 'My Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const titles = {
  '/dashboard': 'Dashboard',
  '/dashboard/appointments': 'My Appointments',
  '/dashboard/reviews': 'My Reviews',
  '/dashboard/profile': 'My Profile',
  '/dashboard/settings': 'Settings',
};

export default function CustomerLayout() {
  const { pathname } = useLocation();
  return (
    <DashboardShell title={titles[pathname] || 'Dashboard'} nav={nav}>
      <Outlet />
    </DashboardShell>
  );
}
