import { Router } from 'express';
import {
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listPromotions);
router.post('/', protect, requireAdmin, upload.single('image'), createPromotion);
router.put('/:id', protect, requireAdmin, upload.single('image'), updatePromotion);
router.delete('/:id', protect, requireAdmin, deletePromotion);

export default router;
