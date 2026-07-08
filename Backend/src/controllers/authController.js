import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';
import { isEmail, requireFields } from '../utils/validate.js';

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar_url: u.avatar_url,
  created_at: u.created_at,
});

// POST /api/auth/register  (customers only)
export const register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  const { name, email, password, phone } = req.body;

  if (!isEmail(email)) throw ApiError.badRequest('Please provide a valid email');
  if (String(password).length < 6)
    throw ApiError.badRequest('Password must be at least 6 characters');

  const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (exists.rowCount) throw ApiError.conflict('An account with this email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING *`,
    [name.trim(), email.toLowerCase().trim(), password_hash, phone || null]
  );
  const user = rows[0];
  const token = signToken({ id: user.id, role: user.role });

  res.status(201).json({ success: true, token, user: publicUser(user) });
});

// POST /api/auth/login  (customers + admin)
export const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const { email, password } = req.body;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [
    email.toLowerCase().trim(),
  ]);
  const user = rows[0];
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.is_active) throw ApiError.forbidden('Your account has been deactivated');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ id: user.id, role: user.role });
  res.json({ success: true, token, user: publicUser(user) });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) throw ApiError.notFound('User not found');
  res.json({ success: true, user: publicUser(rows[0]) });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar_url } = req.body;
  const { rows } = await query(
    `UPDATE users
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name || null, phone ?? null, avatar_url ?? null, req.user.id]
  );
  res.json({ success: true, user: publicUser(rows[0]) });
});

// PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ['currentPassword', 'newPassword']);
  const { currentPassword, newPassword } = req.body;
  if (String(newPassword).length < 6)
    throw ApiError.badRequest('New password must be at least 6 characters');

  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = rows[0];
  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) throw ApiError.badRequest('Current password is incorrect');

  const password_hash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    password_hash,
    req.user.id,
  ]);
  res.json({ success: true, message: 'Password updated successfully' });
});
