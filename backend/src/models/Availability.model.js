import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema, model, models } = mongoose;
const uuid = () => uuidv4();
const roles = ["USER", "MENTOR", "ADMIN"];

const availabilitySchema = new Schema(
  {
    _id: { type: String, default: uuid },
    userId: { type: String, default: null, index: true },
    mentorId: { type: String, default: null, index: true },
    role: { type: String, enum: roles, required: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

availabilitySchema.index(
  { userId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "string" } } },
);

availabilitySchema.index(
  { mentorId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { mentorId: { $type: "string" } } },
);

export const Availability = models.Availability || model("Availability", availabilitySchema);