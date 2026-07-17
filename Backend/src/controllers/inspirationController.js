import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { requireFields } from '../utils/validate.js';
import { sendBookingApproved } from '../utils/mailer.js';

const VALID_STATUS = ['pending', 'approved', 'rejected'];

// Resolve (or create) a customer account for a guest by email.
async function resolveCustomer({ userId, name, email, phone }) {
  if (userId) return userId;
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    await query(
      `UPDATE users SET phone = COALESCE(NULLIF(phone, ''), $1), updated_at = NOW() WHERE id = $2`,
      [phone || null, existing.rows[0].id]
    );
    return existing.rows[0].id;
  }
  const randomHash = await bcrypt.hash(`guest:${email}:${process.hrtime.bigint().toString(36)}`, 10);
  const created = await query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1,$2,$3,$4,'customer') RETURNING id`,
    [name, email, randomHash, phone || null]
  );
  return created.rows[0].id;
}

// POST /api/inspirations  (guest or logged-in; multipart or JSON)
// A booking request made with an inspiration photo instead of a listed service.
export const createInspiration = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'preferred_date', 'preferred_time']);
  const { name, email, phone, note, preferred_date, preferred_time } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);
  if (!image_url) throw ApiError.badRequest('Please attach an inspiration image or paste an image URL');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    throw ApiError.badRequest('Please provide a valid email address');
  }

  const when = new Date(`${preferred_date}T${preferred_time}`);
  if (isNaN(when.getTime())) throw ApiError.badRequest('Invalid preferred date or time');
  if (when.getTime() < Date.now()) throw ApiError.badRequest('The preferred time cannot be in the past');

  const posY = req.body.image_pos_y != null && req.body.image_pos_y !== '' ? Number(req.body.image_pos_y) : 50;
  const zoom = req.body.image_zoom != null && req.body.image_zoom !== '' ? Number(req.body.image_zoom) : 1;

  const { rows } = await query(
    `INSERT INTO inspirations (customer_id, name, email, phone, note, image_url, image_pos_y, image_zoom, preferred_date, preferred_time, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
    [
      req.user?.id || null,
      String(name).trim(),
      String(email).trim().toLowerCase(),
      phone ? String(phone).trim() : null,
      note ? String(note).trim() : null,
      image_url,
      posY,
      zoom,
      preferred_date,
      preferred_time,
    ]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// GET /api/inspirations  (admin)  ?status=
export const listInspirations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && VALID_STATUS.includes(status)) {
    params.push(status);
    where = `WHERE status = $${params.length}`;
  }
  const { rows } = await query(
    `SELECT * FROM inspirations ${where} ORDER BY created_at DESC`,
    params
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// PUT /api/inspirations/:id/approve  (admin) — hold the appointment (confirmed)
export const approveInspiration = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM inspirations WHERE id = $1', [req.params.id]);
  const insp = rows[0];
  if (!insp) throw ApiError.notFound('Inspiration not found');
  if (insp.appointment_id) throw ApiError.badRequest('This request is already approved');
  if (!insp.preferred_date || !insp.preferred_time) {
    throw ApiError.badRequest('This request has no preferred date/time');
  }

  const customerId = await resolveCustomer({
    userId: insp.customer_id,
    name: insp.name,
    email: insp.email,
    phone: insp.phone,
  });

  const appt = await query(
    `INSERT INTO appointments
       (customer_id, service_id, appointment_date, appointment_time, notes, status,
        price_snapshot, service_name_snapshot, inspiration_image)
     VALUES ($1, NULL, $2, $3, $4, 'confirmed', NULL, 'Custom look (inspiration)', $5)
     RETURNING *`,
    [customerId, insp.preferred_date, insp.preferred_time, insp.note || null, insp.image_url]
  );

  const updated = await query(
    `UPDATE inspirations SET status = 'approved', appointment_id = $1 WHERE id = $2 RETURNING *`,
    [appt.rows[0].id, insp.id]
  );

  // Notify the customer (non-blocking)
  sendBookingApproved({
    to: insp.email,
    name: insp.name,
    serviceName: 'Your inspiration look',
    date: insp.preferred_date,
    time: insp.preferred_time,
    note: insp.note,
  });

  res.json({ success: true, data: updated.rows[0], appointment: appt.rows[0] });
});

// PUT /api/inspirations/:id/reject  (admin) — decline the request
export const rejectInspiration = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM inspirations WHERE id = $1', [req.params.id]);
  const insp = rows[0];
  if (!insp) throw ApiError.notFound('Inspiration not found');

  // If an appointment was already created, cancel it too.
  if (insp.appointment_id) {
    await query(`UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [insp.appointment_id]);
  }
  const updated = await query(
    `UPDATE inspirations SET status = 'rejected', appointment_id = NULL WHERE id = $1 RETURNING *`,
    [insp.id]
  );
  res.json({ success: true, data: updated.rows[0] });
});

// DELETE /api/inspirations/:id  (admin)
export const deleteInspiration = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM inspirations WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Inspiration not found');
  res.json({ success: true, message: 'Inspiration deleted' });
});
