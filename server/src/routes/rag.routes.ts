import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  indexDocument,
  queryDocuments,
  getIndexStatus,
  deleteIndex,
  queryValidation,
} from '../controllers/rag.controller';

const router = express.Router();

router.use(protect);
router.use(aiRateLimiter);

router.post('/index/:documentId', indexDocument);
router.post('/query', queryValidation, validate, queryDocuments);
router.get('/status/:documentId', getIndexStatus);
router.delete('/index/:documentId', deleteIndex);

export default router;
