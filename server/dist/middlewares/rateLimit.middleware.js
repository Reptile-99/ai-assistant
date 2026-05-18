"use strict";
/**
 * Rate Limiting Middleware
 * Two-tier rate limiting:
 * - Per-user AI limiter: 20 requests/minute (after auth)
 * - Global IP limiter: 100 requests/minute (pre-auth guard)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRateLimiter = exports.aiRateLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
// ─── Response formatter ───────────────────────────────────────────────────────
const rateLimitHandler = (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000 / 60);
    res.status(429).json({
        success: false,
        error: 'Too many requests — please slow down',
        retryAfter: `${retryAfter} minute${retryAfter !== 1 ? 's' : ''}`,
        limit: options.max,
    });
};
// ─── Per-user AI rate limiter ─────────────────────────────────────────────────
// Keyed by user ID (requires auth middleware to run first)
exports.aiRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '20', 10),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Key by authenticated user ID; fall back to normalized IP
        if (req.user?.id)
            return req.user.id;
        const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
        return ip.replace(/^::ffff:/, '');
    },
    handler: rateLimitHandler,
    message: 'AI rate limit exceeded',
});
// ─── Global IP-based rate limiter ────────────────────────────────────────────
// Applied before auth — acts as a DDoS/abuse guard
exports.globalRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
        return ip.replace(/^::ffff:/, '');
    },
    handler: rateLimitHandler,
    message: 'Global rate limit exceeded',
});
