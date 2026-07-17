import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/notifications  — recent notifications + unread count for the current user
export const listNotifications = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, type, title, message, link, is_read, created_at
       FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
    [req.user.id]
  );
  const unread = rows.filter((n) => !n.is_read).length;
  res.json({ success: true, count: rows.length, unread, data: rows });
});

// GET /api/notifications/unread-count  — lightweight badge poll
export const unreadCount = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [req.user.id]
  );
  res.json({ success: true, count: rows[0].count });
});

// PUT /api/notifications/:id/read  — mark one notification read
export const markRead = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE
      WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Notification not found');
  res.json({ success: true });
});

// PUT /api/notifications/read-all  — mark all read
export const markAllRead = asyncHandler(async (req, res) => {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [req.user.id]
  );
  res.json({ success: true });
});
