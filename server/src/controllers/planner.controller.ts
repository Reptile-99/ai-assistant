import { Request, Response } from 'express';
import Task from '../models/Task';
import Exam from '../models/Exam';
import { aiProvider } from '../services/ai.provider';

export const getPlannerData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const tasks = await Task.find({ userId });
    const exams = await Exam.find({ userId });
    res.json({ tasks, exams });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching planner data', error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task({ ...req.body, userId: (req as any).user?._id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user?._id },
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: (req as any).user?._id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const exam = new Exam({ ...req.body, userId: (req as any).user?._id });
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam', error });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user?._id },
      req.body,
      { new: true }
    );
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error updating exam', error });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, userId: (req as any).user?._id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error });
  }
};

export const generateAISchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const exams = await Exam.find({ userId });
    
    const examPayload = exams.map(e => ({ subject: e.subject, date: e.date.toISOString() }));
    
    const { tasks } = await aiProvider.generateStudySchedule(examPayload, 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const createdTasks = await Promise.all(tasks.map(async (t) => {
      const taskDate = new Date(today);
      taskDate.setDate(taskDate.getDate() + t.dayOffset);
      
      const task = new Task({
        userId,
        title: t.title,
        subject: t.subject,
        duration: t.duration,
        priority: t.priority,
        date: taskDate
      });
      return await task.save();
    }));
    
    res.json(createdTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI schedule', error });
  }
};
