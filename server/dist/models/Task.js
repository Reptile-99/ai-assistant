"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TaskSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    duration: { type: Number, required: true, default: 30 }, // in minutes
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    date: { type: Date, required: true }, // The calendar date this task is assigned to
}, { timestamps: true });
exports.default = mongoose_1.default.models.Task || mongoose_1.default.model("Task", TaskSchema);
