import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document';
import { ragService } from '../services/rag.service';
import { embeddingService } from '../services/embedding.service';
import { ErrorResponse } from '../middlewares/error.middleware';

export const queryValidation = [
  body('question').notEmpty().withMessage('question is required').isString(),
  body('documentId').optional().isMongoId().withMessage('documentId must be a valid MongoDB ObjectId'),
];

export const indexDocument = async (req: any, res: Response, next: NextFunction) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId);

    if (!document) {
      return next(new ErrorResponse(`Document not found`, 404));
    }

    if (document.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this document', 401));
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
    const result = await ragService.indexDocument(document);

    res.status(200).json({
      success: true,
      data: {
        chunkCount: result?.chunkCount,
        model: embeddingService.getModelInfo().model,
        dimensions: embeddingService.getModelInfo().dimensions,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const queryDocuments = async (req: any, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const { question, documentId } = req.body;

    if (documentId) {
      const document = await Document.findById(documentId);
      if (!document || document.userId.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized or document not found', 401));
      }
    }

    const result = await ragService.queryDocuments(question, {
      userId: req.user.id,
      documentId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getIndexStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return next(new ErrorResponse(`Document not found`, 404));
    }

    if (document.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    res.status(200).json({
      success: true,
      data: {
        isIndexed: document.isIndexed,
        chunkCount: document.chunkCount,
        indexedAt: document.indexedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIndex = async (req: any, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return next(new ErrorResponse(`Document not found`, 404));
    }

    if (document.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    await ragService.deleteDocumentIndex(document.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Document vectors deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
