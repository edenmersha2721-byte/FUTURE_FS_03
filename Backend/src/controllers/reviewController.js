import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { requireFields, toBool } from '../utils/validate.js';

const SELECT_FULL = `
  SELECT r.*, u.name AS customer_name, u.avatar_url, s.name AS service_name
  FROM reviews r
  JOIN users u ON u.id = r.customer_id
  LEFT JOIN services s ON s.id = r.service_id
`;

// GET /api/reviews ?featured=true
export const listReviews = asyncHandler(async (req, res) => {
  const featured = req.query.featured === 'true';
  const { rows } = await query(
    `${SELECT_FULL}
     WHERE r.is_approved = TRUE ${featured ? 'AND r.is_featured = TRUE' : ''}
     ORDER BY r.created_at DESC`
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/reviews/mine (customer)
export const myReviews = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `${SELECT_FULL} WHERE r.customer_id = $1 ORDER BY r.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// POST /api/reviews (customer)
export const createReview = asyncHandler(async (req, res) => {
  requireFields(req.body, ['rating', 'comment']);
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) throw ApiError.badRequest('Rating must be between 1 and 5');
  const { service_id, comment } = req.body;
  const { rows } = await query(
    `INSERT INTO reviews (customer_id, service_id, rating, comment)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, service_id || null, rating, comment.trim()]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// DELETE /api/reviews/:id  (customer own OR admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const sql = isAdmin
    ? 'DELETE FROM reviews WHERE id = $1'
    : 'DELETE FROM reviews WHERE id = $1 AND customer_id = $2';
  const params = isAdmin ? [req.params.id] : [req.params.id, req.user.id];
  const { rowCount } = await query(sql, params);
  if (!rowCount) throw ApiError.notFound('Review not found');
  res.json({ success: true, message: 'Review deleted' });
});

// ---------- Admin ----------

// GET /api/reviews/all (admin)
export const listAllReviews = asyncHandler(async (req, res) => {
  const { rows } = await query(`${SELECT_FULL} ORDER BY r.created_at DESC`);
  res.json({ success: true, count: rows.length, data: rows });
});

// PUT /api/reviews/:id (admin) - toggle featured/approved
export const updateReview = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `UPDATE reviews SET
       is_featured = COALESCE($1, is_featured),
       is_approved = COALESCE($2, is_approved)
     WHERE id = $3 RETURNING *`,
    [toBool(req.body.is_featured) ?? null, toBool(req.body.is_approved) ?? null, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Review not found');
  res.json({ success: true, data: rows[0] });
});
