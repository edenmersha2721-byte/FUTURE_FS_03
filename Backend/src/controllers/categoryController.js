import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { requireFields, toBool } from '../utils/validate.js';

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const { rows } = await query(
    `SELECT c.*,
            COUNT(s.id) FILTER (WHERE s.is_active) AS service_count
     FROM categories c
     LEFT JOIN services s ON s.category_id = c.id
     ${activeOnly ? 'WHERE c.is_active = TRUE' : ''}
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/categories/:id
export const getCategory = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Category not found');
  res.json({ success: true, data: rows[0] });
});

// POST /api/categories (admin)
export const createCategory = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);
  const { name, description, icon, image_url } = req.body;
  const slug = slugify(name);
  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, icon, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name.trim(), slug, description || null, icon || null, image_url || null, toBool(req.body.is_active) ?? true]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image_url } = req.body;
  const slug = name ? slugify(name) : null;
  const isActive = toBool(req.body.is_active);
  const { rows } = await query(
    `UPDATE categories SET
       name = COALESCE($1, name),
       slug = COALESCE($2, slug),
       description = COALESCE($3, description),
       icon = COALESCE($4, icon),
       image_url = COALESCE($5, image_url),
       is_active = COALESCE($6, is_active)
     WHERE id = $7 RETURNING *`,
    [name || null, slug, description ?? null, icon ?? null, image_url ?? null, isActive ?? null, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Category not found');
  res.json({ success: true, data: rows[0] });
});

// DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Category not found');
  res.json({ success: true, message: 'Category deleted' });
});
