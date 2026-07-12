import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Customer dashboard
import CustomerLayout from './pages/customer/CustomerLayout.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import CustomerAppointments from './pages/customer/CustomerAppointments.jsx';
import CustomerReviews from './pages/customer/CustomerReviews.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';
import CustomerSettings from './pages/customer/CustomerSettings.jsx';

// Admin dashboard
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminServices from './pages/admin/AdminServices.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';
import AdminGallery from './pages/admin/AdminGallery.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public one-page site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Booking — open to guests and logged-in customers */}
      <Route path="/book" element={<BookingPage />} />

      {/* Customer dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerHome />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
