import api from './api.client';

export interface Task {
  _id: string;
  title: string;
  subject: string;
  duration: number;
  done: boolean;
  priority: "high" | "medium" | "low";
  date: string; // ISO string
}

export interface Exam {
  _id: string;
  subject: string;
  date: string; // ISO string
  color: string;
}

export const getPlannerData = async () => {
  const response = await api.get('/planner');
  return response.data as { tasks: Task[], exams: Exam[] };
};

export const createTask = async (data: Partial<Task>) => {
  const response = await api.post('/planner/tasks', data);
  return response.data as Task;
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  const response = await api.put(`/planner/tasks/${id}`, data);
  return response.data as Task;
};

export const deleteTask = async (id: string) => {
  await api.delete(`/planner/tasks/${id}`);
};

export const createExam = async (data: Partial<Exam>) => {
  const response = await api.post('/planner/exams', data);
  return response.data as Exam;
};

export const updateExam = async (id: string, data: Partial<Exam>) => {
  const response = await api.put(`/planner/exams/${id}`, data);
  return response.data as Exam;
};

export const deleteExam = async (id: string) => {
  await api.delete(`/planner/exams/${id}`);
};

export const generateAISchedule = async () => {
  const response = await api.post('/planner/generate');
  return response.data as Task[];
};
