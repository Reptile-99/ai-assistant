"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFlashcard = exports.updateFlashcard = exports.getFlashcards = exports.generateFlashcards = exports.updateFlashcardValidation = exports.generateFlashcardValidation = void 0;
const express_validator_1 = require("express-validator");
const Document_1 = __importDefault(require("../models/Document"));
const Flashcard_1 = __importDefault(require("../models/Flashcard"));
const ai_service_1 = require("../services/ai.service");
const error_middleware_1 = require("../middlewares/error.middleware");
// Validation Rules
exports.generateFlashcardValidation = [
    (0, express_validator_1.body)('documentId').isMongoId().withMessage('Valid documentId is required'),
    (0, express_validator_1.body)('count').isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20'),
    (0, express_validator_1.body)('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
];
exports.updateFlashcardValidation = [
    (0, express_validator_1.body)('front').optional().isString().notEmpty(),
    (0, express_validator_1.body)('back').optional().isString().notEmpty(),
    (0, express_validator_1.body)('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    (0, express_validator_1.body)('mastered').optional().isBoolean(),
];
// Generate Flashcards
const generateFlashcards = async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new error_middleware_1.ErrorResponse(errors.array()[0].msg, 400));
    }
    try {
        const { documentId, count, difficulty } = req.body;
        const document = await Document_1.default.findById(documentId);
        if (!document) {
            return next(new error_middleware_1.ErrorResponse(`Document not found`, 404));
        }
        if (document.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to access this document', 401));
        }
        const result = await ai_service_1.openAIService.generateFlashcards(document.content, count, difficulty, document.title);
        const flashcardsToInsert = result.flashcards.map((card) => ({
            userId: req.user.id,
            documentId: document._id,
            deckName: document.title,
            front: card.front,
            back: card.back,
            difficulty,
            mastered: false,
        }));
        const savedCards = await Flashcard_1.default.insertMany(flashcardsToInsert);
        res.status(201).json({
            success: true,
            data: savedCards,
            tokenUsage: result.tokenUsage,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateFlashcards = generateFlashcards;
// Get all flashcards for user
const getFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard_1.default.find({ userId: req.user.id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFlashcards = getFlashcards;
// Update a flashcard
const updateFlashcard = async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new error_middleware_1.ErrorResponse(errors.array()[0].msg, 400));
    }
    try {
        let flashcard = await Flashcard_1.default.findById(req.params.id);
        if (!flashcard) {
            return next(new error_middleware_1.ErrorResponse(`Flashcard not found`, 404));
        }
        if (flashcard.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to update this flashcard', 401));
        }
        flashcard = await Flashcard_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: flashcard
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFlashcard = updateFlashcard;
// Delete a flashcard
const deleteFlashcard = async (req, res, next) => {
    try {
        const flashcard = await Flashcard_1.default.findById(req.params.id);
        if (!flashcard) {
            return next(new error_middleware_1.ErrorResponse(`Flashcard not found`, 404));
        }
        if (flashcard.userId.toString() !== req.user.id) {
            return next(new error_middleware_1.ErrorResponse('Not authorized to delete this flashcard', 401));
        }
        await flashcard.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFlashcard = deleteFlashcard;
