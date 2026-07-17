import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scissors, Tags, CalendarDays, Users, Image, BadgePercent, Star, Mail, Sparkles, Clock,
} from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell.jsx';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/hours', label: 'Business Hours', icon: Clock },
  { to: '/admin/services', label: 'Services', icon: Scissors },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/inspirations', label: 'Inspirations', icon: Sparkles },
  { to: '/admin/promotions', label: 'Promotions', icon: BadgePercent },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
];

const titles = {
  '/admin': 'Dashboard Overview',
  '/admin/appointments': 'Appointments',
  '/admin/hours': 'Business Hours',
  '/admin/services': 'Service Management',
  '/admin/categories': 'Category Management',
  '/admin/customers': 'Customers',
  '/admin/gallery': 'Gallery Management',
  '/admin/inspirations': 'Inspiration Requests',
  '/admin/promotions': 'Promotions',
  '/admin/reviews': 'Reviews',
  '/admin/messages': 'Contact Messages',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <DashboardShell title={titles[pathname] || 'Admin'} nav={nav}>
      <Outlet />
    </DashboardShell>
  );
}
