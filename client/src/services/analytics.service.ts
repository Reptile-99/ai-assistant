import api from './api.client';

export interface DashboardStats {
  studyHours: { day: string; hours: number }[];
  uploadStats: { name: string; uploads: number }[];
  flashcardProgress: { subject: string; mastery: number; total: number }[];
  productivityTrends: { day: string; focus: number; distraction: number }[];
  aiUsage: { name: string; value: number; fill: string }[];
  streak: number;
  chatSessions: number;
  todaysGoals: { label: string; current: number; target: number; unit: string; color: string }[];
}

export const getDashboardStats = async () => {
  const response = await api.get('/analytics');
  return response.data as DashboardStats;
};

export const getAnalyticsStats = getDashboardStats;
