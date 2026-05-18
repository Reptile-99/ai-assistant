import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getDashboardStats } from '../controllers/analytics.controller';

const router = express.Router();

router.use(protect);
router.get('/', getDashboardStats);

export default router;
