"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndex = exports.getIndexStatus = exports.queryDocuments = exports.indexDocument = exports.queryValidation = void 0;
const express_validator_1 = require("express-validator");
const Document_1 = __importDefault(require("../models/Document"));
const rag_service_1 = require("../services/rag.service");
const embedding_service_1 = require("../services/embedding.service");
const error_middleware_1 = require("../middlewares/error.middleware");
exports.queryValidation = [
    (0, express_validator_1.body)('question').notEmpty().withMessage('question is required').isString(),
    (0, express_validator_1.body)('documentId').optional().isMongoId().withMessage('documentId must be a valid MongoDB ObjectId'),
];
const indexDocument = async (req, res, next) => {
    try {
        const documentId = req.params.documentId;
        const document = await Document_1.default.findById(documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found`, 404));
        }
        if (document.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to access this document', 401));
        }
        if (document.isIndexed) {
            return res.status(200).json({
                success: true,
                message: 'Document is already indexed.',
                chunkCount: document.chunkCount,
            });
        }
        // Trigger indexing synchronously or asynchronously. Here we await for immediate feedback if desired,
        // or we can just start it and return if it takes too long.
        // For large documents, this might timeout the HTTP request. 
        // Usually it's better to run it async, but for simplicity we'll await it here.
        const result = await rag_service_1.ragService.indexDocument(document);
        res.status(200).json({
            success: true,
            data: {
                chunkCount: result?.chunkCount,
                model: embedding_service_1.embeddingService.getModelInfo().model,
                dimensions: embedding_service_1.embeddingService.getModelInfo().dimensions,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.indexDocument = indexDocument;
const queryDocuments = async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new error_middleware_1.ErrorResponse(errors.array()[0].msg, 400));
    }
    try {
        const { question, documentId } = req.body;
        if (documentId) {
            const document = await Document_1.default.findById(documentId);
            if (!document || document.userId.toString() !== req.user.id) {
                return next(new error_middleware_1.ErrorResponse('Not authorized or document not found', 401));
            }
        }
        const result = await rag_service_1.ragService.queryDocuments(question, {
            userId: req.user.id,
            documentId,
        });
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.queryDocuments = queryDocuments;
const getIndexStatus = async (req, res, next) => {
    try {
        const document = await Document_1.default.findById(req.params.documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found`, 404));
        }
        if (document.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized', 401));
        }
        res.status(200).json({
            success: true,
            data: {
                isIndexed: document.isIndexed,
                chunkCount: document.chunkCount,
                indexedAt: document.indexedAt,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getIndexStatus = getIndexStatus;
const deleteIndex = async (req, res, next) => {
    try {
        const document = await Document_1.default.findById(req.params.documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found`, 404));
        }
        if (document.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized', 401));
        }
        await rag_service_1.ragService.deleteDocumentIndex(document.id, req.user.id);
        res.status(200).json({
            success: true,
            message: 'Document vectors deleted successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteIndex = deleteIndex;
