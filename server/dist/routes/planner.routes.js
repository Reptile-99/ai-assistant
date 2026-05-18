"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const planner_controller_1 = require("../controllers/planner.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/', planner_controller_1.getPlannerData);
router.post('/tasks', planner_controller_1.createTask);
router.put('/tasks/:id', planner_controller_1.updateTask);
router.delete('/tasks/:id', planner_controller_1.deleteTask);
router.post('/exams', planner_controller_1.createExam);
router.put('/exams/:id', planner_controller_1.updateExam);
router.delete('/exams/:id', planner_controller_1.deleteExam);
router.post('/generate', planner_controller_1.generateAISchedule);
exports.default = router;
