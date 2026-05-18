import api from './api.client';

export interface PomodoroStats {
  totalFocusMinutesToday: number;
  totalFocusMinutesAllTime: number;
  completedSessionsToday: number;
  history: any[];
}

export const recordPomodoroSession = async (duration: number, type: 'work' | 'break') => {
  const response = await api.post('/pomodoro/session', { duration, type });
  return response.data;
};

export const getPomodoroStats = async () => {
  const response = await api.get('/pomodoro/stats');
  return response.data as PomodoroStats;
};
