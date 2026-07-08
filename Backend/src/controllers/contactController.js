import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { isEmail, requireFields } from '../utils/validate.js';

// POST /api/contact  (public)
export const createMessage = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'message']);
  const { name, email, phone, subject, message } = req.body;
  if (!isEmail(email)) throw ApiError.badRequest('Please provide a valid email');
  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, phone, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name.trim(), email.toLowerCase().trim(), phone || null, subject || null, message.trim()]
  );
  res.status(201).json({ success: true, data: rows[0], message: 'Message sent — we will be in touch soon!' });
});

// GET /api/contact  (admin)
export const listMessages = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json({ success: true, count: rows.length, data: rows });
});

// PUT /api/contact/:id/read  (admin)
export const markRead = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Message not found');
  res.json({ success: true, data: rows[0] });
});

// DELETE /api/contact/:id  (admin)
export const deleteMessage = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Message not found');
  res.json({ success: true, message: 'Message deleted' });
});
