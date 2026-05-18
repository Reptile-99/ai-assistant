"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const error_middleware_1 = require("./error.middleware");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    }
    // Make sure token exists
    if (!token) {
        return next(new error_middleware_1.ErrorResponse('Not authorized to access this route', 401));
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Get user from the token
        req.user = await User_1.default.findById(decoded.id);
        if (!req.user) {
            return next(new error_middleware_1.ErrorResponse('No user found with this id', 404));
        }
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new error_middleware_1.ErrorResponse('Token expired', 401));
        }
        return next(new error_middleware_1.ErrorResponse('Not authorized to access this route', 401));
    }
};
exports.protect = protect;
