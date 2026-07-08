import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/gallery ?category=
export const listGallery = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const params = [];
  let where = '';
  if (category && category !== 'all') {
    params.push(category);
    where = `WHERE LOWER(category) = LOWER($1)`;
  }
  const { rows } = await query(
    `SELECT * FROM gallery ${where} ORDER BY created_at DESC`,
    params
  );
  res.json({ success: true, count: rows.length, data: rows });
});

// POST /api/gallery (admin) - image_url from body or uploaded file
export const createGalleryItem = asyncHandler(async (req, res) => {
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
  if (!image_url) throw ApiError.badRequest('An image (file or image_url) is required');
  const { title, description, category } = req.body;
  const { rows } = await query(
    `INSERT INTO gallery (title, description, category, image_url)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [title || null, description || null, category || null, image_url]
  );
  res.status(201).json({ success: true, data: rows[0] });
});

// DELETE /api/gallery/:id (admin)
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
  if (!rowCount) throw ApiError.notFound('Gallery item not found');
  res.json({ success: true, message: 'Gallery item deleted' });
});
