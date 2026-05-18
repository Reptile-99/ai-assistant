"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_controller_1 = require("../controllers/document.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
// Apply protection to all document routes
router.use(auth_middleware_1.protect);
router.post('/upload', multer_1.upload.single('file'), document_controller_1.uploadDocument);
router.get('/', document_controller_1.getDocuments);
router.get('/:id', document_controller_1.getDocument);
router.delete('/:id', document_controller_1.deleteDocument);
exports.default = router;
