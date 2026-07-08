import { Router } from 'express';
import {
  listGallery,
  createGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listGallery);
router.post('/', protect, requireAdmin, upload.single('image'), createGalleryItem);
router.delete('/:id', protect, requireAdmin, deleteGalleryItem);

export default router;
