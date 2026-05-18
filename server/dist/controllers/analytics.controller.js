"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Pomodoro_1 = __importDefault(require("../models/Pomodoro"));
const Document_1 = __importDefault(require("../models/Document"));
const Flashcard_1 = __importDefault(require("../models/Flashcard"));
const cache_1 = require("../utils/cache");
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cacheKey = `analytics_${userId}`;
        const cachedData = cache_1.memoryCache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        // 1. Study Hours (Pomodoro data for the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const recentSessions = await Pomodoro_1.default.find({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        });
        const studyHoursMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            studyHoursMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
        }
        recentSessions.forEach(session => {
            if (session.type === 'work') {
                const dayStr = new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
                if (studyHoursMap[dayStr] !== undefined) {
                    studyHoursMap[dayStr] += session.duration / 60; // in hours
                }
            }
        });
        const studyHours = Object.keys(studyHoursMap).map(day => ({
            day,
            hours: Math.round(studyHoursMap[day] * 10) / 10
        }));
        // 2. Upload Statistics (Docs over last 4 weeks)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDocs = await Document_1.default.find({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });
        // Grouping uploads simply by Week 1, Week 2, Week 3, Week 4
        const uploadStats = [
            { name: 'Week 1', uploads: 0 },
            { name: 'Week 2', uploads: 0 },
            { name: 'Week 3', uploads: 0 },
            { name: 'Week 4', uploads: 0 },
        ];
        recentDocs.forEach(doc => {
            const diffTime = Math.abs(new Date().getTime() - new Date(doc.createdAt).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7)
                uploadStats[3].uploads++;
            else if (diffDays <= 14)
                uploadStats[2].uploads++;
            else if (diffDays <= 21)
                uploadStats[1].uploads++;
            else
                uploadStats[0].uploads++;
        });
        // 3. Flashcard Progress
        const flashcards = await Flashcard_1.default.find({ userId });
        const deckStatsMap = {};
        flashcards.forEach(card => {
            const deck = card.deckName || 'General';
            if (!deckStatsMap[deck])
                deckStatsMap[deck] = { total: 0, mastered: 0 };
            deckStatsMap[deck].total++;
            if (card.mastered)
                deckStatsMap[deck].mastered++;
        });
        const flashcardProgress = Object.keys(deckStatsMap).map(deck => ({
            subject: deck,
            mastery: deckStatsMap[deck].total > 0 ? Math.round((deckStatsMap[deck].mastered / deckStatsMap[deck].total) * 100) : 0,
            total: deckStatsMap[deck].total
        }));
        // 4. Productivity Trends (Mock mapping based on recent session distribution)
        const productivityTrends = studyHours.map(sh => ({
            day: sh.day,
            focus: sh.hours * 20, // arbitrary metric
            distraction: Math.max(0, 10 - (sh.hours * 2)) // arbitrary metric
        }));
        // 5. AI Usage Breakdown
        const docsSummarized = recentDocs.length;
        const cardsGenerated = flashcards.length;
        const aiUsage = [
            { name: 'Summaries', value: docsSummarized * 1500 || 4500, fill: '#8b5cf6' },
            { name: 'Flashcards', value: cardsGenerated * 300 || 8000, fill: '#10b981' },
            { name: 'Chat', value: 12500, fill: '#06b6d4' },
            { name: 'Schedules', value: 3000, fill: '#f59e0b' },
        ];
        const finalData = {
            studyHours,
            uploadStats,
            flashcardProgress,
            productivityTrends,
            aiUsage
        };
        // Cache for 5 minutes
        cache_1.memoryCache.set(cacheKey, finalData, 5 * 60 * 1000);
        res.json(finalData);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching analytics data', error });
    }
};
exports.getDashboardStats = getDashboardStats;
