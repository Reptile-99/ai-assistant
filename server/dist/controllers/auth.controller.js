"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const error_middleware_1 = require("../middlewares/error.middleware");
const auth_1 = require("../utils/auth");
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return next(new error_middleware_1.ErrorResponse('User already exists', 400));
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
        });
        // Save refresh token to user before response (or just generate it)
        const refreshToken = (0, auth_1.sendTokenResponse)(user, 201, res);
        user.refreshTokens.push(refreshToken);
        await user.save();
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check for user email
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return next(new error_middleware_1.ErrorResponse('Invalid credentials', 401));
        }
        const refreshToken = (0, auth_1.sendTokenResponse)(user, 200, res);
        // Save refresh token to user (manage multiple devices if needed, here we just append)
        user.refreshTokens.push(refreshToken);
        await user.save();
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public (uses cookie)
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return next(new error_middleware_1.ErrorResponse('No refresh token provided', 401));
        }
        // Find user by refresh token
        const user = await User_1.default.findOne({ refreshTokens: token });
        if (!user) {
            return next(new error_middleware_1.ErrorResponse('Invalid refresh token', 403));
        }
        // Verify token
        jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) {
                return next(new error_middleware_1.ErrorResponse('Invalid refresh token', 403));
            }
            const accessToken = (0, auth_1.generateAccessToken)(user._id);
            res.json({ success: true, accessToken });
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
// @desc    Logout / Clear Cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            // Remove refresh token from DB
            await User_1.default.findOneAndUpdate({ refreshTokens: token }, { $pull: { refreshTokens: token } });
        }
        res.cookie('refreshToken', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
