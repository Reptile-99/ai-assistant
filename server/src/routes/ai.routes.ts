/**
 * AI Routes
 * All routes are protected (JWT) and rate limited.
 */

import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimit.middleware';
import {
  summarizeDocument,
  summarizeText,
  getAvailableSummaryTypes,
  clearSummaryCache,
  summarizeDocumentValidation,
  summarizeTextValidation,
} from '../controllers/ai.controller';
import { validate } from '../middlewares/validate.middleware';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Apply per-user AI rate limiter to all AI routes
router.use(aiRateLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/ai/summary-types
 * Returns list of available summary types with labels and descriptions.
 */
router.get('/summary-types', getAvailableSummaryTypes);

/**
 * POST /api/ai/summarize
 * Summarize a stored document by ID.
 * Body: { documentId: string, summaryType: SummaryType }
 */
router.post(
  '/summarize',
  summarizeDocumentValidation,
  validate,
  summarizeDocument
);

/**
 * POST /api/ai/summarize/text
 * Summarize raw text directly.
 * Body: { text: string, summaryType: SummaryType, title?: string }
 */
router.post(
  '/summarize/text',
  summarizeTextValidation,
  validate,
  summarizeText
);

/**
 * DELETE /api/ai/summarize/:documentId/cache
 * Clear cached summaries for a document.
 * Query: ?type=short|detailed|bullet|key_concepts (optional — omit to clear all)
 */
router.delete('/summarize/:documentId/cache', clearSummaryCache);

export default router;
