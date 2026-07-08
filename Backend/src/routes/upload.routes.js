import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// POST /api/upload  (admin) - generic single image upload -> returns URL
router.post(
  '/',
  protect,
  requireAdmin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No image uploaded');
    res.status(201).json({ success: true, url: `/uploads/${req.file.filename}` });
  })
);

export default router;
