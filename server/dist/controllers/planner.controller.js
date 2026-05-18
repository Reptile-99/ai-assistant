"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAISchedule = exports.deleteExam = exports.updateExam = exports.createExam = exports.deleteTask = exports.updateTask = exports.createTask = exports.getPlannerData = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Exam_1 = __importDefault(require("../models/Exam"));
const ai_service_1 = require("../services/ai.service");
const getPlannerData = async (req, res) => {
    try {
        const userId = req.user?._id;
        const tasks = await Task_1.default.find({ userId });
        const exams = await Exam_1.default.find({ userId });
        res.json({ tasks, exams });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching planner data', error });
    }
};
exports.getPlannerData = getPlannerData;
const createTask = async (req, res) => {
    try {
        const task = new Task_1.default({ ...req.body, userId: req.user?._id });
        await task.save();
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id }, req.body, { new: true });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        await Task_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user?._id });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
};
exports.deleteTask = deleteTask;
const createExam = async (req, res) => {
    try {
        const exam = new Exam_1.default({ ...req.body, userId: req.user?._id });
        await exam.save();
        res.status(201).json(exam);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating exam', error });
    }
};
exports.createExam = createExam;
const updateExam = async (req, res) => {
    try {
        const exam = await Exam_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id }, req.body, { new: true });
        res.json(exam);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating exam', error });
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res) => {
    try {
        await Exam_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user?._id });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting exam', error });
    }
};
exports.deleteExam = deleteExam;
const generateAISchedule = async (req, res) => {
    try {
        const userId = req.user?._id;
        const exams = await Exam_1.default.find({ userId });
        const examPayload = exams.map(e => ({ subject: e.subject, date: e.date.toISOString() }));
        const { tasks } = await ai_service_1.openAIService.generateStudySchedule(examPayload, 7);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const createdTasks = await Promise.all(tasks.map(async (t) => {
            const taskDate = new Date(today);
            taskDate.setDate(taskDate.getDate() + t.dayOffset);
            const task = new Task_1.default({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating AI schedule', error });
    }
};
exports.generateAISchedule = generateAISchedule;
