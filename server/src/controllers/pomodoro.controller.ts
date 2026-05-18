import { Response } from 'express';
import Pomodoro from '../models/Pomodoro';
import { AuthRequest } from '../types/express';

export const recordSession = async (req: AuthRequest, res: Response) => {
  try {
    const { duration, type } = req.body;
    const session = new Pomodoro({
      userId: req.user?._id,
      duration,
      type
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error recording pomodoro session', error });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // Calculate start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get all sessions
    const allSessions = await Pomodoro.find({ userId });
    
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pomodoro stats', error });
  }
};
