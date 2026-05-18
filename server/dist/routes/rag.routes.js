"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const rag_controller_1 = require("../controllers/rag.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use(rateLimit_middleware_1.aiRateLimiter);
router.post('/index/:documentId', rag_controller_1.indexDocument);
router.post('/query', rag_controller_1.queryValidation, validate_middleware_1.validate, rag_controller_1.queryDocuments);
router.get('/status/:documentId', rag_controller_1.getIndexStatus);
router.delete('/index/:documentId', rag_controller_1.deleteIndex);
exports.default = router;
