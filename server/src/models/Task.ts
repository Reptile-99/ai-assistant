import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    duration: { type: Number, required: true, default: 30 }, // in minutes
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    date: { type: Date, required: true }, // The calendar date this task is assigned to
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
