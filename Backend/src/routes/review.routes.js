import { Router } from 'express';
import {
  listReviews,
  myReviews,
  createReview,
  deleteReview,
  listAllReviews,
  updateReview,
} from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listReviews);
router.get('/mine', protect, myReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

// Admin
router.get('/all', protect, requireAdmin, listAllReviews);
router.put('/:id', protect, requireAdmin, updateReview);

export default router;
