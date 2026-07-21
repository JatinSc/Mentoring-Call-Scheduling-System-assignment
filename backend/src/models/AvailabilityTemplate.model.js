import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema, model, models } = mongoose;
const uuid = () => uuidv4();
const roles = ["USER", "MENTOR", "ADMIN"];

const availabilityTemplateSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    userId: { type: String, default: null },
    mentorId: { type: String, default: null },
    role: { type: String, enum: roles, required: true },
    slots: {
      type: [{ dayOfWeek: Number, hour: Number, _id: false }],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

availabilityTemplateSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "string" } } },
);

availabilityTemplateSchema.index(
  { mentorId: 1 },
  { unique: true, partialFilterExpression: { mentorId: { $type: "string" } } },
);

export const AvailabilityTemplate = models.AvailabilityTemplate || model("AvailabilityTemplate", availabilityTemplateSchema);