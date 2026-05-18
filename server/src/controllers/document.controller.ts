import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
const pdf = require('pdf-parse');
import Document from '../models/Document';
import { ErrorResponse } from '../middlewares/error.middleware';
import { ragService } from '../services/rag.service';
import { AuthRequest } from '../types/express';

interface MulterAuthRequest extends AuthRequest {
  file?: Express.Multer.File;
}

// @desc    Upload a PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req: MulterAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Extract text from PDF
    const data = await pdf(dataBuffer);

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      userId: req.user?.id,
      fileUrl: req.file.path,
      content: data.text,
      fileSize: req.file.size,
      pageCount: data.numpages
    });

    // Fire and forget indexing
    ragService.indexDocument(document).catch((err) => {
      console.error(`Background indexing failed for document ${document._id}:`, err);
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    // If error, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all documents for logged in user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const documents = await Document.find({ userId: req.user?.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
    }

    // Check ownership
    if (document.userId.toString() !== req.user?.id) {
      return next(new ErrorResponse('Not authorized to access this document', 401));
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
    }

    // Check ownership
    if (document.userId.toString() !== req.user?.id) {
      return next(new ErrorResponse('Not authorized to delete this document', 401));
    }

    // Delete file from filesystem
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    // Attempt to delete vector index
    try {
      await ragService.deleteDocumentIndex(document.id, req.user?.id || '');
    } catch (indexError) {
      console.error(`Failed to delete vectors for document ${document.id}:`, indexError);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
