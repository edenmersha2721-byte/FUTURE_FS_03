import { query } from '../config/db.js';
import { ApiError } from './ApiError.js';

export const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toMinutes = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hhmm = (t) => String(t).slice(0, 5); // "09:00:00" -> "09:00"

// Day of week (0=Sun) for a 'YYYY-MM-DD' string, parsed in local time.
export const dowOf = (dateStr) => new Date(`${dateStr}T00:00:00`).getDay();

export async function getWeeklyHours() {
  const { rows } = await query(
    `SELECT day_of_week, is_open, open_time, close_time
       FROM business_hours ORDER BY day_of_week`
  );
  return rows;
}

export async function getClosedDates() {
  const { rows } = await query(
    `SELECT id, to_char(date, 'YYYY-MM-DD') AS date, reason
       FROM closed_dates ORDER BY date`
  );
  return rows;
}

/** Hours row for a specific date's weekday, or null. */
export async function hoursForDate(dateStr) {
  const { rows } = await query(
    'SELECT is_open, open_time, close_time FROM business_hours WHERE day_of_week = $1',
    [dowOf(dateStr)]
  );
  return rows[0] || null;
}

export async function isClosedDate(dateStr) {
  const { rowCount } = await query('SELECT 1 FROM closed_dates WHERE date = $1 LIMIT 1', [dateStr]);
  return rowCount > 0;
}

/** Hourly start times bookable on a date: [] if closed. */
export function generateSlots(hours, stepMinutes = 60) {
  if (!hours || !hours.is_open) return [];
  const open = toMinutes(hours.open_time);
  const close = toMinutes(hours.close_time);
  const slots = [];
  for (let t = open; t < close; t += stepMinutes) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }
  return slots;
}

/**
 * Throw an ApiError if a booking of `durationMinutes` starting at date/time
 * falls on a closed date, a closed weekday, or outside working hours.
 */
export async function assertBookable(dateStr, timeStr, durationMinutes = 30) {
  if (await isClosedDate(dateStr)) {
    throw ApiError.badRequest('The salon is closed on this date. Please choose another day.');
  }

  const hours = await hoursForDate(dateStr);
  if (!hours || !hours.is_open) {
    throw ApiError.badRequest(`The salon is closed on ${DOW_NAMES[dowOf(dateStr)]}s. Please choose another day.`);
  }

  const start = toMinutes(timeStr);
  const end = start + (durationMinutes || 0);
  const open = toMinutes(hours.open_time);
  const close = toMinutes(hours.close_time);
  if (start < open || end > close) {
    throw ApiError.badRequest(
      `Please choose a time within working hours (${hhmm(hours.open_time)}–${hhmm(hours.close_time)}).`
    );
  }
}
