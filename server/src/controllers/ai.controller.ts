/**
 * AI Controller
 * Handles summarization requests, orchestrating the OpenAI service,
 * document retrieval, and summary caching.
 */

import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document';
import { OpenAIServiceError } from '../services/ai.service';
import { aiProvider } from '../services/ai.provider';
import { isValidSummaryType, SUMMARY_TYPE_DEFINITIONS, SummaryType } from '../services/prompt.engine';
import { ErrorResponse } from '../middlewares/error.middleware';
import { estimateTokens } from '../services/token.optimizer';
import { AuthRequest } from '../types/express';

// ─── Validation Rules ─────────────────────────────────────────────────────────

export const summarizeDocumentValidation = [
  body('documentId')
    .notEmpty().withMessage('documentId is required')
    .isMongoId().withMessage('documentId must be a valid MongoDB ObjectId'),
  body('summaryType')
    .notEmpty().withMessage('summaryType is required')
    .custom((v) => {
      if (!isValidSummaryType(v)) {
        throw new Error(`summaryType must be one of: short, detailed, bullet, key_concepts`);
      }
      return true;
    }),
];

export const summarizeTextValidation = [
  body('text')
    .notEmpty().withMessage('text is required')
    .isLength({ min: 50 }).withMessage('text must be at least 50 characters'),
  body('summaryType')
    .notEmpty().withMessage('summaryType is required')
    .custom((v) => {
      if (!isValidSummaryType(v)) {
        throw new Error(`summaryType must be one of: short, detailed, bullet, key_concepts`);
      }
      return true;
    }),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Run express-validator checks and throw if invalid */
function checkValidation(req: AuthRequest, next: NextFunction): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new ErrorResponse(errors.array()[0].msg, 400));
    return false;
  }
  return true;
}

/** Map OpenAIServiceError → HTTP response */
function handleAIError(err: unknown, next: NextFunction): void {
  if (err instanceof OpenAIServiceError) {
    next(new ErrorResponse(err.message, err.statusCode));
  } else {
    next(err);
  }
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Summarize a stored document by ID
 * @route   POST /api/ai/summarize
 * @access  Private
 */
export const summarizeDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!checkValidation(req, next)) return;

  try {
    const { documentId, summaryType } = req.body as {
      documentId: string;
      summaryType: SummaryType;
    };

    // Fetch and authorize document
    const document = await Document.findById(documentId);
    if (!document) {
      return next(new ErrorResponse(`Document not found`, 404));
    }
    if (document.userId.toString() !== req.user?.id) {
      return next(new ErrorResponse('Not authorized to access this document', 401));
    }

    // Check summary cache first
    const cached = document.summaries?.get(summaryType);
    if (cached) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: {
          summary: cached.content,
          type: summaryType,
          tokenUsage: { totalTokens: cached.tokenUsage },
          generatedAt: cached.generatedAt,
          documentTitle: document.title,
        },
      });
    }

    // Generate summary via AI provider (Gemini first, OpenAI fallback)
    const result = await aiProvider.summarize(
      document.content,
      summaryType,
      document.title
    );

    // Persist summary to document cache
    if (!document.summaries) {
      document.summaries = new Map();
    }
    document.summaries.set(summaryType, {
      content: result.summary,
      generatedAt: new Date(),
      tokenUsage: result.tokenUsage.totalTokens,
    });
    await document.save();

    res.status(200).json({
      success: true,
      cached: false,
      data: {
        summary: result.summary,
        type: result.type,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        chunksProcessed: result.chunksProcessed,
        model: result.model,
        provider: result.provider,
        documentTitle: document.title,
        estimatedInputTokens: estimateTokens(document.content),
      },
    });
  } catch (err) {
    handleAIError(err, next);
  }
};

/**
 * @desc    Summarize raw text (no DB lookup needed)
 * @route   POST /api/ai/summarize/text
 * @access  Private
 */
export const summarizeText = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!checkValidation(req, next)) return;

  try {
    const { text, summaryType, title = 'Provided Text' } = req.body as {
      text: string;
      summaryType: SummaryType;
      title?: string;
    };

    const result = await aiProvider.summarize(text, summaryType, title);

    res.status(200).json({
      success: true,
      data: {
        summary: result.summary,
        type: result.type,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        chunksProcessed: result.chunksProcessed,
        model: result.model,
        provider: result.provider,
        estimatedInputTokens: estimateTokens(text),
      },
    });
  } catch (err) {
    handleAIError(err, next);
  }
};

/**
 * @desc    Get list of available summary types with descriptions
 * @route   GET /api/ai/summary-types
 * @access  Private
 */
export const getAvailableSummaryTypes = (
  _req: AuthRequest,
  res: Response
) => {
  res.status(200).json({
    success: true,
    data: SUMMARY_TYPE_DEFINITIONS,
  });
};

/**
 * @desc    Clear cached summaries for a document (force regeneration)
 * @route   DELETE /api/ai/summarize/:documentId/cache
 * @access  Private
 */
export const clearSummaryCache = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }
    if (document.userId.toString() !== req.user?.id) {
      return next(new ErrorResponse('Not authorized to modify this document', 401));
    }

    const { type } = req.query as { type?: SummaryType };

    if (type) {
      // Clear specific type only
      if (!isValidSummaryType(type)) {
        return next(new ErrorResponse(`Invalid summary type: ${type}`, 400));
      }
      document.summaries?.delete(type);
    } else {
      // Clear all cached summaries
      document.summaries = new Map();
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: type
        ? `Cache cleared for summary type: ${type}`
        : 'All summary caches cleared',
    });
  } catch (err) {
    next(err);
  }
};
