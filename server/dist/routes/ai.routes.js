"use strict";
/**
 * AI Routes
 * All routes are protected (JWT) and rate limited.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const ai_controller_1 = require("../controllers/ai.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = express_1.default.Router();
// All AI routes require authentication
router.use(auth_middleware_1.protect);
// Apply per-user AI rate limiter to all AI routes
router.use(rateLimit_middleware_1.aiRateLimiter);
// ─── Routes ───────────────────────────────────────────────────────────────────
/**
 * GET /api/ai/summary-types
 * Returns list of available summary types with labels and descriptions.
 */
router.get('/summary-types', ai_controller_1.getAvailableSummaryTypes);
/**
 * POST /api/ai/summarize
 * Summarize a stored document by ID.
 * Body: { documentId: string, summaryType: SummaryType }
 */
router.post('/summarize', ai_controller_1.summarizeDocumentValidation, validate_middleware_1.validate, ai_controller_1.summarizeDocument);
/**
 * POST /api/ai/summarize/text
 * Summarize raw text directly.
 * Body: { text: string, summaryType: SummaryType, title?: string }
 */
router.post('/summarize/text', ai_controller_1.summarizeTextValidation, validate_middleware_1.validate, ai_controller_1.summarizeText);
/**
 * DELETE /api/ai/summarize/:documentId/cache
 * Clear cached summaries for a document.
 * Query: ?type=short|detailed|bullet|key_concepts (optional — omit to clear all)
 */
router.delete('/summarize/:documentId/cache', ai_controller_1.clearSummaryCache);
exports.default = router;
