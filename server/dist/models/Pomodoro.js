"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PomodoroSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    duration: { type: Number, required: true }, // duration in minutes
    type: { type: String, enum: ["work", "break"], required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Pomodoro || mongoose_1.default.model("Pomodoro", PomodoroSchema);
