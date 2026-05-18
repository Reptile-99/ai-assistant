import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getPlannerData,
  createTask,
  updateTask,
  deleteTask,
  createExam,
  updateExam,
  deleteExam,
  generateAISchedule
} from '../controllers/planner.controller';

const router = express.Router();

router.use(protect);

router.get('/', getPlannerData);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

router.post('/generate', generateAISchedule);

export default router;
