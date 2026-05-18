"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.recordSession = void 0;
const Pomodoro_1 = __importDefault(require("../models/Pomodoro"));
const recordSession = async (req, res) => {
    try {
        const { duration, type } = req.body;
        const session = new Pomodoro_1.default({
            userId: req.user?._id,
            duration,
            type
        });
        await session.save();
        res.status(201).json(session);
    }
    catch (error) {
        res.status(500).json({ message: 'Error recording pomodoro session', error });
    }
};
exports.recordSession = recordSession;
const getStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        // Calculate start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        // Get all sessions
        const allSessions = await Pomodoro_1.default.find({ userId });
        const todaySessions = allSessions.filter(s => new Date(s.createdAt) >= startOfToday);
        const totalFocusMinutesToday = todaySessions
            .filter(s => s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0);
        const totalFocusMinutesAllTime = allSessions
            .filter(s => s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0);
        const completedSessionsToday = todaySessions.filter(s => s.type === 'work').length;
        res.json({
            totalFocusMinutesToday,
            totalFocusMinutesAllTime,
            completedSessionsToday,
            history: allSessions.slice(-20) // send last 20 sessions for basic history
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pomodoro stats', error });
    }
};
exports.getStats = getStats;
