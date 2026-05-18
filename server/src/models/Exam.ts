import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    color: { type: String, default: "violet" },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
