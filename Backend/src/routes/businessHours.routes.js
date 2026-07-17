import { Router } from 'express';
import {
  getSchedule,
  getDaySlots,
  updateHours,
  addClosedDate,
  removeClosedDate,
} from '../controllers/businessHoursController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public — powers the booking UI
router.get('/', getSchedule);
router.get('/slots', getDaySlots);

// Admin — manage the schedule
router.put('/', protect, requireAdmin, updateHours);
router.post('/closed-dates', protect, requireAdmin, addClosedDate);
router.delete('/closed-dates/:id', protect, requireAdmin, removeClosedDate);

export default router;
