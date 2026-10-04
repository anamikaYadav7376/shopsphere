import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/stats', adminOnly, getStats);

export default router;
