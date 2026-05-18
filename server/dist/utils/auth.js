"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenResponse = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: (process.env.JWT_ACCESS_EXPIRE || '15m'),
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d'),
    });
};
exports.generateRefreshToken = generateRefreshToken;
const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = (0, exports.generateAccessToken)(user._id);
    const refreshToken = (0, exports.generateRefreshToken)(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    res
        .status(statusCode)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
        success: true,
        accessToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
        },
    });
    return refreshToken;
};
exports.sendTokenResponse = sendTokenResponse;
