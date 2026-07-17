import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getWeeklyHours,
  getClosedDates,
  hoursForDate,
  isClosedDate,
  generateSlots,
  DOW_NAMES,
} from '../utils/businessHours.js';

// GET /api/business-hours  (public) — weekly schedule + upcoming closed dates
export const getSchedule = asyncHandler(async (req, res) => {
  const [hours, closedDates] = await Promise.all([getWeeklyHours(), getClosedDates()]);
  res.json({ success: true, data: { hours, closedDates } });
});

// GET /api/business-hours/slots?date=YYYY-MM-DD  (public) — bookable slots for a day
export const getDaySlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw ApiError.badRequest('A date is required');

  if (await isClosedDate(date)) {
    return res.json({ success: true, data: { closed: true, reason: 'holiday', slots: [] } });
  }
  const hours = await hoursForDate(date);
  if (!hours || !hours.is_open) {
    return res.json({ success: true, data: { closed: true, reason: 'weekly', slots: [] } });
  }
  res.json({
    success: true,
    data: {
      closed: false,
      open_time: String(hours.open_time).slice(0, 5),
      close_time: String(hours.close_time).slice(0, 5),
      slots: generateSlots(hours),
    },
  });
});

// PUT /api/business-hours  (admin) — replace the weekly schedule
export const updateHours = asyncHandler(async (req, res) => {
  const { hours } = req.body;
  if (!Array.isArray(hours) || hours.length === 0) {
    throw ApiError.badRequest('Provide an array of weekly hours');
  }

  for (const h of hours) {
    const dow = Number(h.day_of_week);
    if (!Number.isInteger(dow) || dow < 0 || dow > 6) {
      throw ApiError.badRequest('day_of_week must be 0–6');
    }
    const open = h.open_time || '09:00';
    const close = h.close_time || '19:00';
    if (h.is_open && open >= close) {
      throw ApiError.badRequest(`${DOW_NAMES[dow]}: closing time must be after opening time`);
    }
    await query(
      `INSERT INTO business_hours (day_of_week, is_open, open_time, close_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week)
       DO UPDATE SET is_open = EXCLUDED.is_open, open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time`,
      [dow, Boolean(h.is_open), open, close]
    );
  }

  const updated = await getWeeklyHours();
  res.json({ success: true, data: updated });
});

// POST /api/business-hours/closed-dates  (admin)
export const addClosedDate = asyncHandler(async (req, res) => {
  const { date, reason } = req.body;
  if (!date) throw ApiError.badRequest('A date is required');
  const { rows } = await query(
    `INSERT INTO closed_dates (date, reason) VALUES ($1, $2)
     ON CONFLICT (date) DO UPDATE SET reason = EXCLUDED.reason
     RETURNING id, to_char(date, 'YYYY-MM-DD') AS date, reason`,
    [date, reason || null]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// DELETE /api/business-hours/closed-dates/:id  (admin)
export const removeClosedDate = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM closed_dates WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Closed date not found');
  res.json({ success: true });
});
