import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document';
import Flashcard from '../models/Flashcard';
import { openAIService } from '../services/ai.service';
import { ErrorResponse } from '../middlewares/error.middleware';

// Validation Rules
export const generateFlashcardValidation = [
  body('documentId').isMongoId().withMessage('Valid documentId is required'),
  body('count').isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
];

export const updateFlashcardValidation = [
  body('front').optional().isString().notEmpty(),
  body('back').optional().isString().notEmpty(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('mastered').optional().isBoolean(),
];

// Generate Flashcards
export const generateFlashcards = async (req: any, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const { documentId, count, difficulty } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return next(new ErrorResponse(`Document not found`, 404));
    }

    if (document.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this document', 401));
    }

    const result = await openAIService.generateFlashcards(document.content, count, difficulty, document.title);

    const flashcardsToInsert = result.flashcards.map((card: any) => ({
      userId: req.user.id,
      documentId: document._id,
      deckName: document.title,
      front: card.front,
      back: card.back,
      difficulty,
      mastered: false,
    }));

    const savedCards = await Flashcard.insertMany(flashcardsToInsert);

    res.status(201).json({
      success: true,
      data: savedCards,
      tokenUsage: result.tokenUsage,
    });
  } catch (error) {
    next(error);
  }
};

// Get all flashcards for user
export const getFlashcards = async (req: any, res: Response, next: NextFunction) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    next(error);
  }
};

// Update a flashcard
export const updateFlashcard = async (req: any, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    let flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return next(new ErrorResponse(`Flashcard not found`, 404));
    }

    if (flashcard.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this flashcard', 401));
    }

    flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    next(error);
  }
};

// Delete a flashcard
export const deleteFlashcard = async (req: any, res: Response, next: NextFunction) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return next(new ErrorResponse(`Flashcard not found`, 404));
    }

    if (flashcard.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this flashcard', 401));
    }

    await flashcard.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
