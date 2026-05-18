import dotenv from 'dotenv';
// Load env vars FIRST — before any other imports that may initialize singletons
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import aiRoutes from './routes/ai.routes';
import ragRoutes from './routes/rag.routes';
import flashcardRoutes from './routes/flashcard.routes';
import plannerRoutes from './routes/planner.routes';
import pomodoroRoutes from './routes/pomodoro.routes';
import analyticsRoutes from './routes/analytics.routes';
import errorHandler from './middlewares/error.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';

// Connect to database
connectDB();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (required for Render)
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use(cookieParser());
app.use(globalRateLimiter);

// Static folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('AI Study Assistant API is running');
});

// Error handler (must be after routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
