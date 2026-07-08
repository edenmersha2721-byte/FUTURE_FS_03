import { Router } from 'express';
import {
  createMessage,
  listMessages,
  markRead,
  deleteMessage,
} from '../controllers/contactController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createMessage);
router.get('/', protect, requireAdmin, listMessages);
router.put('/:id/read', protect, requireAdmin, markRead);
router.delete('/:id', protect, requireAdmin, deleteMessage);

export default router;
