"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = express_1.default.Router();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];
const loginValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists()
];
router.post('/register', registerValidation, validate_middleware_1.validate, auth_controller_1.register);
router.post('/login', loginValidation, validate_middleware_1.validate, auth_controller_1.login);
router.post('/refresh', auth_controller_1.refreshToken);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
