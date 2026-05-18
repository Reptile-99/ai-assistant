import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  getDocument, 
  deleteDocument 
} from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = express.Router();

// Apply protection to all document routes
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
