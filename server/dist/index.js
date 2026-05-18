"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ⚠️ MUST be the very first line — require() is NOT hoisted by TypeScript.
// Using import would hoist ALL imports before dotenv.config() runs,
// causing service singletons (Gemini, OpenAI) to initialize without env vars.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const rag_routes_1 = __importDefault(require("./routes/rag.routes"));
const flashcard_routes_1 = __importDefault(require("./routes/flashcard.routes"));
const planner_routes_1 = __importDefault(require("./routes/planner.routes"));
const pomodoro_routes_1 = __importDefault(require("./routes/pomodoro.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (required for Render)
const port = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)()); // Set security HTTP headers
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use((0, cookie_parser_1.default)());
app.use(rateLimit_middleware_1.globalRateLimiter);
// Static folder
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/rag', rag_routes_1.default);
app.use('/api/flashcards', flashcard_routes_1.default);
app.use('/api/planner', planner_routes_1.default);
app.use('/api/pomodoro', pomodoro_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.get('/', (req, res) => {
    res.send('AI Study Assistant API is running');
});
// Error handler (must be after routes)
app.use(error_middleware_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
