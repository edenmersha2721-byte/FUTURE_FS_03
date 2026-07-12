import { Router } from 'express';
import {
  createAppointment,
  myAppointments,
  cancelMyAppointment,
  listAppointments,
  updateAppointmentStatus,
  getAppointment,
} from '../controllers/appointmentController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Booking — open to guests and logged-in customers
router.post('/', optionalAuth, createAppointment);

// Customer
router.get('/mine', protect, myAppointments);
router.put('/:id/cancel', protect, cancelMyAppointment);

// Admin
router.get('/', protect, requireAdmin, listAppointments);
router.get('/:id', protect, requireAdmin, getAppointment);
router.put('/:id/status', protect, requireAdmin, updateAppointmentStatus);

export default router;
