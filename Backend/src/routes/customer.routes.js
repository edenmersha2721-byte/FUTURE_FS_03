import { Router } from 'express';
import {
  listCustomers,
  getCustomer,
  setCustomerStatus,
} from '../controllers/customerController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(protect, requireAdmin);
router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.put('/:id/status', setCustomerStatus);

export default router;
