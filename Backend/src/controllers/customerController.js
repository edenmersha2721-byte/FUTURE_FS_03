import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { toBool } from '../utils/validate.js';

// GET /api/customers (admin) ?search=
export const listCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const params = [];
  let where = "WHERE u.role = 'customer'";
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
            COUNT(a.id) AS total_appointments
     FROM users u
     LEFT JOIN appointments a ON a.customer_id = u.id
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    params
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/customers/:id (admin) - profile + booking history
export const getCustomer = asyncHandler(async (req, res) => {
  const u = await query(
    "SELECT id, name, email, phone, is_active, created_at FROM users WHERE id = $1 AND role = 'customer'",
    [req.params.id]
  );
  if (!u.rowCount) throw ApiError.notFound('Customer not found');

  const appts = await query(
    `SELECT a.*, s.name AS service_name
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE a.customer_id = $1
     ORDER BY a.appointment_date DESC`,
    [req.params.id]
  );
  res.json({ success: true, data: { ...u.rows[0], appointments: appts.rows } });
});

// PUT /api/customers/:id/status (admin) - activate/deactivate
export const setCustomerStatus = asyncHandler(async (req, res) => {
  const isActive = toBool(req.body.is_active);
  if (isActive === undefined) throw ApiError.badRequest('is_active is required');
  const { rows } = await query(
    "UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND role = 'customer' RETURNING id, name, is_active",
    [isActive, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: rows[0] });
});
