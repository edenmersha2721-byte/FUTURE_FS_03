import { Router } from 'express';
import {
  createAppointment,
  bookedSlots,
  myAppointments,
  cancelMyAppointment,
  requestReschedule,
  approveReschedule,
  rejectReschedule,
  listAppointments,
  updateAppointmentStatus,
  getAppointment,
} from '../controllers/appointmentController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Booking — open to guests and logged-in customers
router.post('/', optionalAuth, createAppointment);

// Reserved (confirmed) slots for a given date — public, powers the booking UI
router.get('/booked', bookedSlots);

// Customer
router.get('/mine', protect, myAppointments);
router.put('/:id/cancel', protect, cancelMyAppointment);
router.put('/:id/reschedule', protect, requestReschedule);

// Admin
router.get('/', protect, requireAdmin, listAppointments);
router.get('/:id', protect, requireAdmin, getAppointment);
router.put('/:id/status', protect, requireAdmin, updateAppointmentStatus);
router.put('/:id/reschedule/approve', protect, requireAdmin, approveReschedule);
router.put('/:id/reschedule/reject', protect, requireAdmin, rejectReschedule);

export default router;
