"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocument = exports.getDocuments = exports.uploadDocument = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf = require('pdf-parse');
const Document_1 = __importDefault(require("../models/Document"));
const error_middleware_1 = require("../middlewares/error.middleware");
const rag_service_1 = require("../services/rag.service");
// @desc    Upload a PDF document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new error_middleware_1.ErrorResponse('Please upload a file', 400));
        }
        const dataBuffer = fs_1.default.readFileSync(req.file.path);
        // Extract text from PDF
        const data = await pdf(dataBuffer);
        const document = await Document_1.default.create({
            title: req.body.title || req.file.originalname,
            userId: req.user?.id,
            fileUrl: req.file.path,
            content: data.text,
            fileSize: req.file.size,
            pageCount: data.numpages
        });
        // Fire and forget indexing
        rag_service_1.ragService.indexDocument(document).catch((err) => {
            console.error(`Background indexing failed for document ${document._id}:`, err);
        });
        res.status(201).json({
            success: true,
            data: document
        });
    }
    catch (error) {
        // If error, delete the uploaded file
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
        }
        next(error);
    }
};
exports.uploadDocument = uploadDocument;
// @desc    Get all documents for logged in user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document_1.default.find({ userId: req.user?.id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocuments = getDocuments;
// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res, next) => {
    try {
        const document = await Document_1.default.findById(req.params.id);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
        }
        // Check ownership
        if (document.userId.toString() !== req.user?.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to access this document', 401));
        }
        res.status(200).json({
            success: true,
            data: document
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocument = getDocument;
// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document_1.default.findById(req.params.id);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
        }
        // Check ownership
        if (document.userId.toString() !== req.user?.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to delete this document', 401));
        }
        // Delete file from filesystem
        if (fs_1.default.existsSync(document.fileUrl)) {
            fs_1.default.unlinkSync(document.fileUrl);
        }
        // Attempt to delete vector index
        try {
            await rag_service_1.ragService.deleteDocumentIndex(document.id, req.user?.id || '');
        }
        catch (indexError) {
            console.error(`Failed to delete vectors for document ${document.id}:`, indexError);
        }
        await document.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDocument = deleteDocument;
