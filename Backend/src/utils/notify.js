import { query } from '../config/db.js';

/**
 * Create an in-app notification for a single user. Never throws — a failed
 * notification must not break the request that triggered it.
 */
export async function notifyUser(userId, { type = 'info', title, message, link } = {}) {
  if (!userId || !title) return;
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message || null, link || null]
    );
  } catch (err) {
    console.error('🔔 notifyUser failed:', err.message);
  }
}

/** Active admin users — used to notify/email every admin. */
export async function getActiveAdmins() {
  try {
    const { rows } = await query(
      `SELECT id, name, email FROM users WHERE role = 'admin' AND is_active = TRUE`
    );
    return rows;
  } catch (err) {
    console.error('🔔 getActiveAdmins failed:', err.message);
    return [];
  }
}

/** Create the same in-app notification for every active admin. */
export async function notifyAdmins(payload) {
  const admins = await getActiveAdmins();
  await Promise.all(admins.map((a) => notifyUser(a.id, payload)));
}
