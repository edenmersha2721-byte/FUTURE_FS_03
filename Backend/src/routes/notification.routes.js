import { Router } from 'express';
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All notification routes require a logged-in user (admin or customer).
router.get('/', protect, listNotifications);
router.get('/unread-count', protect, unreadCount);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);

export default router;
