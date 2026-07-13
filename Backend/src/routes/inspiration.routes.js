import { Router } from 'express';
import {
  createInspiration,
  listInspirations,
  approveInspiration,
  rejectInspiration,
  deleteInspiration,
} from '../controllers/inspirationController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public — guests and customers can request an appointment with an inspiration photo
router.post('/', optionalAuth, upload.single('image'), createInspiration);

// Admin
router.get('/', protect, requireAdmin, listInspirations);
router.put('/:id/approve', protect, requireAdmin, approveInspiration);
router.put('/:id/reject', protect, requireAdmin, rejectInspiration);
router.delete('/:id', protect, requireAdmin, deleteInspiration);

export default router;
