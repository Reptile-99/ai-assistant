import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  generateFlashcards,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcardValidation,
  updateFlashcardValidation,
} from '../controllers/flashcard.controller';

const router = express.Router();

router.use(protect);

router.get('/', getFlashcards);
router.post('/generate', aiRateLimiter, generateFlashcardValidation, validate, generateFlashcards);
router.put('/:id', updateFlashcardValidation, validate, updateFlashcard);
router.delete('/:id', deleteFlashcard);

export default router;
