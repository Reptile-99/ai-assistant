"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExamSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    color: { type: String, default: "violet" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Exam || mongoose_1.default.model("Exam", ExamSchema);
