import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema, model, models } = mongoose;
const uuid = () => uuidv4();
const roles = ["USER", "MENTOR", "ADMIN"];

const availabilityExceptionSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    userId: { type: String, default: null },
    mentorId: { type: String, default: null },
    role: { type: String, enum: roles, required: true },
    weekStart: { type: Date, required: true },
    dayOfWeek: { type: Number, required: true },
    hour: { type: Number, required: true },
    enabled: { type: Boolean, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

availabilityExceptionSchema.index(
  { userId: 1, weekStart: 1, dayOfWeek: 1, hour: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "string" } } },
);

availabilityExceptionSchema.index(
  { mentorId: 1, weekStart: 1, dayOfWeek: 1, hour: 1 },
  { unique: true, partialFilterExpression: { mentorId: { $type: "string" } } },
);

export const AvailabilityException = models.AvailabilityException || model("AvailabilityException", availabilityExceptionSchema);