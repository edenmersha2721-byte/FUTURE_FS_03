import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/dashboard/stats  (admin)
export const getStats = asyncHandler(async (req, res) => {
  const [customers, services, todays, pending, completed, revenue, unread] = await Promise.all([
    query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'customer'"),
    query('SELECT COUNT(*)::int AS c FROM services WHERE is_active = TRUE'),
    query('SELECT COUNT(*)::int AS c FROM appointments WHERE appointment_date = CURRENT_DATE'),
    query("SELECT COUNT(*)::int AS c FROM appointments WHERE status = 'pending'"),
    query("SELECT COUNT(*)::int AS c FROM appointments WHERE status = 'completed'"),
    query(
      "SELECT COALESCE(SUM(price_snapshot),0)::float AS total FROM appointments WHERE status = 'completed'"
    ),
    query('SELECT COUNT(*)::int AS c FROM contact_messages WHERE is_read = FALSE'),
  ]);

  const recent = await query(
    `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.price_snapshot,
            u.name AS customer_name, s.name AS service_name
     FROM appointments a
     JOIN users u ON u.id = a.customer_id
     LEFT JOIN services s ON s.id = a.service_id
     ORDER BY a.created_at DESC
     LIMIT 8`
  );

  // Bookings per status for a small chart
  const byStatus = await query(
    'SELECT status, COUNT(*)::int AS count FROM appointments GROUP BY status'
  );

  res.json({
    success: true,
    data: {
      totalCustomers: customers.rows[0].c,
      totalServices: services.rows[0].c,
      todaysAppointments: todays.rows[0].c,
      pendingAppointments: pending.rows[0].c,
      completedAppointments: completed.rows[0].c,
      revenue: revenue.rows[0].total,
      unreadMessages: unread.rows[0].c,
      recentBookings: recent.rows,
      appointmentsByStatus: byStatus.rows,
    },
  });
});
