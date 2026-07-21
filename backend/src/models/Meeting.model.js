import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema, model, models } = mongoose;
const uuid = () => uuidv4();

const meetingSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    adminId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    participants: {
      type: [
        {
          _id: { type: String, default: uuid },
          email: { type: String, required: true },
        },
      ],
      default: [],
    },
    callType: {
      type: String,
      enum: ["Resume Revamp", "Mock Interview", "Job Market Guidance"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
      default: "Scheduled",
    },
    meetingNotes: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Meeting = models.Meeting || model("Meeting", meetingSchema);