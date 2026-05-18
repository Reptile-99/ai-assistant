import mongoose from "mongoose";

const PomodoroSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    duration: { type: Number, required: true }, // duration in minutes
    type: { type: String, enum: ["work", "break"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Pomodoro || mongoose.model("Pomodoro", PomodoroSchema);
