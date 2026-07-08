import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, requireAdmin, getStats);

export default router;
