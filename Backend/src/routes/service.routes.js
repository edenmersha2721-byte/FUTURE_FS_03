import { Router } from 'express';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', protect, requireAdmin, createService);
router.put('/:id', protect, requireAdmin, updateService);
router.delete('/:id', protect, requireAdmin, deleteService);

export default router;
