import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { requireFields } from '../utils/validate.js';
import {
  sendBookingReceived,
  sendBookingApproved,
  sendBookingCancelled,
  sendRescheduleRejected,
  sendAdminNewBooking,
  sendAdminCancelled,
  sendAdminRescheduleRequest,
} from '../utils/mailer.js';
import { notifyUser, notifyAdmins, getActiveAdmins } from '../utils/notify.js';
import { assertBookable } from '../utils/businessHours.js';

// Fetch the full appointment row (customer + service joined).
async function getFullAppointment(appointmentId) {
  const { rows } = await query(`${SELECT_FULL} WHERE a.id = $1`, [appointmentId]);
  return rows[0] || null;
}

// Email the customer a confirmation + create an in-app notification for them.
async function notifyConfirmed(appointmentId) {
  const a = await getFullAppointment(appointmentId);
  if (!a) return;
  const serviceName = a.service_name || a.service_name_snapshot;
  sendBookingApproved({
    to: a.customer_email,
    name: a.customer_name,
    serviceName,
    date: a.appointment_date,
    time: a.appointment_time,
    note: a.notes,
  });
  await notifyUser(a.customer_id, {
    type: 'appointment_confirmed',
    title: 'Appointment confirmed',
    message: `Your ${serviceName || 'appointment'} is confirmed.`,
    link: '/dashboard/appointments',
  });
}

const VALID_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];

// "HH:MM[:SS]" -> minutes since midnight
function timeToMinutes(t) {
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

const SELECT_FULL = `
  SELECT a.*,
         u.name  AS customer_name,
         u.email AS customer_email,
         u.phone AS customer_phone,
         s.name  AS service_name,
         s.duration_minutes,
         s.price AS service_price,
         c.name  AS category_name
  FROM appointments a
  JOIN users u ON u.id = a.customer_id
  LEFT JOIN services s ON s.id = a.service_id
  LEFT JOIN categories c ON c.id = s.category_id
`;

// POST /api/appointments  (guest or logged-in customer)
export const createAppointment = asyncHandler(async (req, res) => {
  requireFields(req.body, ['service_id', 'appointment_date', 'appointment_time']);
  const { service_id, appointment_date, appointment_time, notes } = req.body;

  const svc = await query('SELECT * FROM services WHERE id = $1 AND is_active = TRUE', [service_id]);
  if (!svc.rowCount) throw ApiError.badRequest('Selected service is not available');
  const service = svc.rows[0];

  // Cannot book in the past
  const when = new Date(`${appointment_date}T${appointment_time}`);
  if (isNaN(when.getTime())) throw ApiError.badRequest('Invalid date or time');
  if (when.getTime() < Date.now()) {
    throw ApiError.badRequest('Appointments cannot be booked in the past');
  }

  // Must fall within the salon's working hours and not on a closed day.
  await assertBookable(appointment_date, appointment_time, service.duration_minutes || 30);

  // Prevent overlaps: reject if the requested slot clashes with a pending or
  // confirmed appointment on the same day, accounting for each service's duration.
  const startMin = timeToMinutes(appointment_time);
  const endMin = startMin + (service.duration_minutes || 30);
  const clash = await query(
    `SELECT 1
       FROM appointments a
       LEFT JOIN services s ON s.id = a.service_id
      WHERE a.appointment_date = $1
        AND a.status IN ('pending', 'confirmed')
        AND $2 < (EXTRACT(HOUR FROM a.appointment_time) * 60
                  + EXTRACT(MINUTE FROM a.appointment_time)
                  + COALESCE(s.duration_minutes, 30))
        AND (EXTRACT(HOUR FROM a.appointment_time) * 60
             + EXTRACT(MINUTE FROM a.appointment_time)) < $3
      LIMIT 1`,
    [appointment_date, startMin, endMin]
  );
  if (clash.rowCount) {
    throw ApiError.badRequest('That time slot is already reserved. Please choose another time.');
  }

  // Resolve the customer: logged-in user, or a guest identified by email.
  let customerId;
  if (req.user) {
    customerId = req.user.id;
  } else {
    requireFields(req.body, ['guest_name', 'guest_email', 'guest_phone']);
    const name = String(req.body.guest_name).trim();
    const email = String(req.body.guest_email).trim().toLowerCase();
    const phone = String(req.body.guest_phone).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.badRequest('Please provide a valid email address');
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount) {
      customerId = existing.rows[0].id;
      // Backfill a phone number if the account doesn't have one yet.
      await query(
        `UPDATE users SET phone = COALESCE(NULLIF(phone, ''), $1), updated_at = NOW() WHERE id = $2`,
        [phone, customerId]
      );
    } else {
      // Create a lightweight guest customer account (random, unusable password).
      const randomHash = await bcrypt.hash(`guest:${email}:${Date.now()}`, 10);
      const created = await query(
        `INSERT INTO users (name, email, password_hash, phone, role)
         VALUES ($1,$2,$3,$4,'customer') RETURNING id`,
        [name, email, randomHash, phone]
      );
      customerId = created.rows[0].id;
    }
  }

  const { rows } = await query(
    `INSERT INTO appointments
       (customer_id, service_id, appointment_date, appointment_time, notes, status, price_snapshot, service_name_snapshot)
     VALUES ($1,$2,$3,$4,$5,'pending',$6,$7)
     RETURNING *`,
    [customerId, service_id, appointment_date, appointment_time, notes || null, service.price, service.name]
  );

  // Notify everyone: customer gets a "received / pending" email, admins get an
  // alert email + in-app notification. Failures here never block the booking.
  const full = await getFullAppointment(rows[0].id);
  if (full) {
    sendBookingReceived({
      to: full.customer_email,
      name: full.customer_name,
      serviceName: service.name,
      date: appointment_date,
      time: appointment_time,
    });
    // Customer in-app notification (visible if they log in with this account).
    notifyUser(customerId, {
      type: 'appointment_pending',
      title: 'Booking request received',
      message: `Your ${service.name} request is pending confirmation.`,
      link: '/dashboard/appointments',
    });
    // Admins: email + in-app notification.
    const admins = await getActiveAdmins();
    for (const admin of admins) {
      sendAdminNewBooking({
        to: admin.email,
        customerName: full.customer_name,
        customerPhone: full.customer_phone,
        serviceName: service.name,
        date: appointment_date,
        time: appointment_time,
      });
    }
    notifyAdmins({
      type: 'new_booking',
      title: 'New booking request',
      message: `${full.customer_name} requested ${service.name}.`,
      link: '/admin/appointments',
    });
  }

  res.status(201).json({ success: true, data: rows[0] });
});

// GET /api/appointments/booked?date=YYYY-MM-DD  (public)
// Returns pending + confirmed slots for a day so the booking UI can mark them reserved.
export const bookedSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw ApiError.badRequest('A date is required');

  const { rows } = await query(
    `SELECT a.appointment_time,
            COALESCE(s.duration_minutes, 30) AS duration_minutes
       FROM appointments a
       LEFT JOIN services s ON s.id = a.service_id
      WHERE a.appointment_date = $1
        AND a.status IN ('pending', 'confirmed')
      ORDER BY a.appointment_time`,
    [date]
  );

  const data = rows.map((r) => ({
    time: String(r.appointment_time).slice(0, 5), // "HH:MM"
    duration_minutes: r.duration_minutes,
  }));
  res.json({ success: true, count: data.length, data });
});

// GET /api/appointments/mine  (customer)
export const myAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const params = [req.user.id];
  let where = 'WHERE a.customer_id = $1';
  if (status && VALID_STATUS.includes(status)) {
    params.push(status);
    where += ` AND a.status = $${params.length}`;
  }
  const { rows } = await query(
    `${SELECT_FULL} ${where} ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    params
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// PUT /api/appointments/:id/cancel  (customer cancels own)
export const cancelMyAppointment = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM appointments WHERE id = $1 AND customer_id = $2',
    [req.params.id, req.user.id]
  );
  const appt = rows[0];
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (['completed', 'cancelled'].includes(appt.status)) {
    throw ApiError.badRequest(`Cannot cancel a ${appt.status} appointment`);
  }
  const updated = await query(
    `UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  // Let the admins know a customer cancelled.
  const full = await getFullAppointment(req.params.id);
  if (full) {
    const serviceName = full.service_name || full.service_name_snapshot;
    const admins = await getActiveAdmins();
    for (const admin of admins) {
      sendAdminCancelled({
        to: admin.email,
        customerName: full.customer_name,
        serviceName,
        date: full.appointment_date,
        time: full.appointment_time,
      });
    }
    notifyAdmins({
      type: 'appointment_cancelled',
      title: 'Appointment cancelled',
      message: `${full.customer_name} cancelled their ${serviceName || 'appointment'}.`,
      link: '/admin/appointments',
    });
  }

  res.json({ success: true, data: updated.rows[0] });
});

// PUT /api/appointments/:id/reschedule  (customer requests a new slot)
export const requestReschedule = asyncHandler(async (req, res) => {
  requireFields(req.body, ['appointment_date', 'appointment_time']);
  const { appointment_date, appointment_time } = req.body;

  const { rows } = await query(
    'SELECT * FROM appointments WHERE id = $1 AND customer_id = $2',
    [req.params.id, req.user.id]
  );
  const appt = rows[0];
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (['completed', 'cancelled'].includes(appt.status)) {
    throw ApiError.badRequest(`Cannot reschedule a ${appt.status} appointment`);
  }

  const when = new Date(`${appointment_date}T${appointment_time}`);
  if (isNaN(when.getTime())) throw ApiError.badRequest('Invalid date or time');
  if (when.getTime() < Date.now()) throw ApiError.badRequest('The new time cannot be in the past');

  // New slot must also fall within working hours / not on a closed day.
  const fullAppt = await getFullAppointment(req.params.id);
  await assertBookable(appointment_date, appointment_time, fullAppt?.duration_minutes || 30);

  const updated = await query(
    `UPDATE appointments SET reschedule_date = $1, reschedule_time = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [appointment_date, appointment_time, req.params.id]
  );

  // Ask the admins to approve the new slot.
  const full = await getFullAppointment(req.params.id);
  if (full) {
    const serviceName = full.service_name || full.service_name_snapshot;
    const admins = await getActiveAdmins();
    for (const admin of admins) {
      sendAdminRescheduleRequest({
        to: admin.email,
        customerName: full.customer_name,
        serviceName,
        oldDate: appt.appointment_date,
        oldTime: appt.appointment_time,
        newDate: appointment_date,
        newTime: appointment_time,
      });
    }
    notifyAdmins({
      type: 'reschedule_request',
      title: 'Reschedule request',
      message: `${full.customer_name} wants to move their ${serviceName || 'appointment'}.`,
      link: '/admin/appointments',
    });
  }

  res.json({ success: true, data: updated.rows[0] });
});

// PUT /api/appointments/:id/reschedule/approve  (admin) — apply requested slot
export const approveReschedule = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
  const appt = rows[0];
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (!appt.reschedule_date) throw ApiError.badRequest('No reschedule request to approve');

  const updated = await query(
    `UPDATE appointments SET
       appointment_date = reschedule_date,
       appointment_time = reschedule_time,
       reschedule_date = NULL,
       reschedule_time = NULL,
       status = 'confirmed',
       updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  await notifyConfirmed(req.params.id);
  res.json({ success: true, data: updated.rows[0] });
});

// PUT /api/appointments/:id/reschedule/reject  (admin) — keep original slot
export const rejectReschedule = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
  const appt = rows[0];
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (!appt.reschedule_date) throw ApiError.badRequest('No reschedule request to reject');

  const updated = await query(
    `UPDATE appointments SET reschedule_date = NULL, reschedule_time = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  // Tell the customer their reschedule was declined (original slot kept).
  const full = await getFullAppointment(req.params.id);
  if (full) {
    const serviceName = full.service_name || full.service_name_snapshot;
    sendRescheduleRejected({
      to: full.customer_email,
      name: full.customer_name,
      serviceName,
      date: full.appointment_date,
      time: full.appointment_time,
    });
    notifyUser(full.customer_id, {
      type: 'reschedule_rejected',
      title: 'Reschedule declined',
      message: `Your reschedule request was declined; your original time is kept.`,
      link: '/dashboard/appointments',
    });
  }

  res.json({ success: true, data: updated.rows[0] });
});

// ---------- Admin ----------

// GET /api/appointments  (admin) ?status=&search=&date=
export const listAppointments = asyncHandler(async (req, res) => {
  const { status, search, date } = req.query;
  const params = [];
  const where = [];
  if (status && VALID_STATUS.includes(status)) {
    params.push(status);
    where.push(`a.status = $${params.length}`);
  }
  if (date) {
    params.push(date);
    where.push(`a.appointment_date = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR s.name ILIKE $${params.length})`);
  }
  const sql = `${SELECT_FULL}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
  const { rows } = await query(sql, params);
  res.json({ success: true, count: rows.length, data: rows });
});

// PUT /api/appointments/:id/status  (admin)
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${VALID_STATUS.join(', ')}`);
  }
  const { rows } = await query(
    `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Appointment not found');

  if (status === 'confirmed') {
    await notifyConfirmed(req.params.id);
  } else if (status === 'cancelled') {
    // Admin cancelled — inform the customer.
    const full = await getFullAppointment(req.params.id);
    if (full) {
      const serviceName = full.service_name || full.service_name_snapshot;
      sendBookingCancelled({
        to: full.customer_email,
        name: full.customer_name,
        serviceName,
        date: full.appointment_date,
        time: full.appointment_time,
      });
      notifyUser(full.customer_id, {
        type: 'appointment_cancelled',
        title: 'Appointment cancelled',
        message: `Your ${serviceName || 'appointment'} was cancelled by the salon.`,
        link: '/dashboard/appointments',
      });
    }
  } else if (status === 'completed') {
    const full = await getFullAppointment(req.params.id);
    if (full) {
      notifyUser(full.customer_id, {
        type: 'appointment_completed',
        title: 'Appointment completed',
        message: `Thanks for visiting! We'd love a review of your ${full.service_name || full.service_name_snapshot || 'visit'}.`,
        link: '/dashboard/reviews',
      });
    }
  }

  res.json({ success: true, data: rows[0] });
});

// GET /api/appointments/:id  (admin)
export const getAppointment = asyncHandler(async (req, res) => {
  const { rows } = await query(`${SELECT_FULL} WHERE a.id = $1`, [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Appointment not found');
  res.json({ success: true, data: rows[0] });
});
