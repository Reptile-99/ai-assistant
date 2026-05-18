"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const flashcard_controller_1 = require("../controllers/flashcard.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/', flashcard_controller_1.getFlashcards);
router.post('/generate', rateLimit_middleware_1.aiRateLimiter, flashcard_controller_1.generateFlashcardValidation, validate_middleware_1.validate, flashcard_controller_1.generateFlashcards);
router.put('/:id', flashcard_controller_1.updateFlashcardValidation, validate_middleware_1.validate, flashcard_controller_1.updateFlashcard);
router.delete('/:id', flashcard_controller_1.deleteFlashcard);
exports.default = router;
