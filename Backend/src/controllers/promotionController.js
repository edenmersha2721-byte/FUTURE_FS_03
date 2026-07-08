import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { requireFields, toBool } from '../utils/validate.js';

// GET /api/promotions ?active=true
export const listPromotions = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const { rows } = await query(
    `SELECT * FROM promotions
     ${activeOnly ? 'WHERE is_active = TRUE AND (end_date IS NULL OR end_date >= CURRENT_DATE)' : ''}
     ORDER BY created_at DESC`
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// POST /api/promotions (admin)
export const createPromotion = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title']);
  const { title, description, discount, discount_type, start_date, end_date } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const { rows } = await query(
    `INSERT INTO promotions (title, description, discount, discount_type, image_url, start_date, end_date, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      title.trim(),
      description || null,
      discount ? Number(discount) : 0,
      discount_type === 'fixed' ? 'fixed' : 'percentage',
      image_url,
      start_date || null,
      end_date || null,
      toBool(req.body.is_active) ?? true,
    ]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// PUT /api/promotions/:id (admin)
export const updatePromotion = asyncHandler(async (req, res) => {
  const { title, description, discount, discount_type, start_date, end_date } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
  const { rows } = await query(
    `UPDATE promotions SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       discount = COALESCE($3, discount),
       discount_type = COALESCE($4, discount_type),
       image_url = COALESCE($5, image_url),
       start_date = COALESCE($6, start_date),
       end_date = COALESCE($7, end_date),
       is_active = COALESCE($8, is_active)
     WHERE id = $9 RETURNING *`,
    [
      title || null,
      description ?? null,
      discount != null && discount !== '' ? Number(discount) : null,
      discount_type || null,
      image_url ?? null,
      start_date || null,
      end_date || null,
      toBool(req.body.is_active) ?? null,
      req.params.id,
    ]
  );
  if (!rows[0]) throw ApiError.notFound('Promotion not found');
  res.json({ success: true, data: rows[0] });
});

// DELETE /api/promotions/:id (admin)
export const deletePromotion = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM promotions WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Promotion not found');
  res.json({ success: true, message: 'Promotion deleted' });
});
