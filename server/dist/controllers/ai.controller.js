"use strict";
/**
 * AI Controller
 * Handles summarization requests, orchestrating the OpenAI service,
 * document retrieval, and summary caching.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSummaryCache = exports.getAvailableSummaryTypes = exports.summarizeText = exports.summarizeDocument = exports.summarizeTextValidation = exports.summarizeDocumentValidation = void 0;
const express_validator_1 = require("express-validator");
const Document_1 = __importDefault(require("../models/Document"));
const ai_service_1 = require("../services/ai.service");
const ai_provider_1 = require("../services/ai.provider");
const prompt_engine_1 = require("../services/prompt.engine");
const error_middleware_1 = require("../middlewares/error.middleware");
const token_optimizer_1 = require("../services/token.optimizer");
// ─── Validation Rules ─────────────────────────────────────────────────────────
exports.summarizeDocumentValidation = [
    (0, express_validator_1.body)('documentId')
        .notEmpty().withMessage('documentId is required')
        .isMongoId().withMessage('documentId must be a valid MongoDB ObjectId'),
    (0, express_validator_1.body)('summaryType')
        .notEmpty().withMessage('summaryType is required')
        .custom((v) => {
        if (!(0, prompt_engine_1.isValidSummaryType)(v)) {
            throw new Error(`summaryType must be one of: short, detailed, bullet, key_concepts`);
        }
        return true;
    }),
];
exports.summarizeTextValidation = [
    (0, express_validator_1.body)('text')
        .notEmpty().withMessage('text is required')
        .isLength({ min: 50 }).withMessage('text must be at least 50 characters'),
    (0, express_validator_1.body)('summaryType')
        .notEmpty().withMessage('summaryType is required')
        .custom((v) => {
        if (!(0, prompt_engine_1.isValidSummaryType)(v)) {
            throw new Error(`summaryType must be one of: short, detailed, bullet, key_concepts`);
        }
        return true;
    }),
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Run express-validator checks and throw if invalid */
function checkValidation(req, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        next(new error_middleware_1.ErrorResponse(errors.array()[0].msg, 400));
        return false;
    }
    return true;
}
/** Map OpenAIServiceError → HTTP response */
function handleAIError(err, next) {
    if (err instanceof ai_service_1.OpenAIServiceError) {
        next(new error_middleware_1.ErrorResponse(err.message, err.statusCode));
    }
    else {
        next(err);
    }
}
// ─── Controllers ──────────────────────────────────────────────────────────────
/**
 * @desc    Summarize a stored document by ID
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeDocument = async (req, res, next) => {
    if (!checkValidation(req, next))
        return;
    try {
        const { documentId, summaryType } = req.body;
        // Fetch and authorize document
        const document = await Document_1.default.findById(documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found`, 404));
        }
        if (document.userId.toString() !== req.user?.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to access this document', 401));
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
        const result = await ai_provider_1.aiProvider.summarize(document.content, summaryType, document.title);
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
                estimatedInputTokens: (0, token_optimizer_1.estimateTokens)(document.content),
            },
        });
    }
    catch (err) {
        handleAIError(err, next);
    }
};
exports.summarizeDocument = summarizeDocument;
/**
 * @desc    Summarize raw text (no DB lookup needed)
 * @route   POST /api/ai/summarize/text
 * @access  Private
 */
const summarizeText = async (req, res, next) => {
    if (!checkValidation(req, next))
        return;
    try {
        const { text, summaryType, title = 'Provided Text' } = req.body;
        const result = await ai_provider_1.aiProvider.summarize(text, summaryType, title);
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
                estimatedInputTokens: (0, token_optimizer_1.estimateTokens)(text),
            },
        });
    }
    catch (err) {
        handleAIError(err, next);
    }
};
exports.summarizeText = summarizeText;
/**
 * @desc    Get list of available summary types with descriptions
 * @route   GET /api/ai/summary-types
 * @access  Private
 */
const getAvailableSummaryTypes = (_req, res) => {
    res.status(200).json({
        success: true,
        data: prompt_engine_1.SUMMARY_TYPE_DEFINITIONS,
    });
};
exports.getAvailableSummaryTypes = getAvailableSummaryTypes;
/**
 * @desc    Clear cached summaries for a document (force regeneration)
 * @route   DELETE /api/ai/summarize/:documentId/cache
 * @access  Private
 */
const clearSummaryCache = async (req, res, next) => {
    try {
        const document = await Document_1.default.findById(req.params.documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse('Document not found', 404));
        }
        if (document.userId.toString() !== req.user?.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to modify this document', 401));
        }
        const { type } = req.query;
        if (type) {
            // Clear specific type only
            if (!(0, prompt_engine_1.isValidSummaryType)(type)) {
                return next(new error_middleware_1.ErrorResponse(`Invalid summary type: ${type}`, 400));
            }
            document.summaries?.delete(type);
        }
        else {
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
    }
    catch (err) {
        next(err);
    }
};
exports.clearSummaryCache = clearSummaryCache;
