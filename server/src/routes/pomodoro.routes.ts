import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { recordSession, getStats } from '../controllers/pomodoro.controller';

const router = express.Router();

router.use(protect);

router.post('/session', recordSession);
router.get('/stats', getStats);

export default router;
