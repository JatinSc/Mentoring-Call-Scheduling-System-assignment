import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema, model, models } = mongoose;
const uuid = () => uuidv4();
const roles = ["USER", "MENTOR", "ADMIN"];

const userSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: roles, default: "USER" },
    bio: { type: String, default: "" },
    company: { type: String, default: "" },
    designation: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    expertise: [{ type: String, default: "" }],
    tags: [{ type: String, default: "" }],
    linkedin: { type: String, default: "" },
    careerStage: {
      type: String,
      enum: ["Student", "Fresher", "Working Professional", "Career Switcher"],
    },
    targetRole: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    goals: {
      type: String,
      default: "",
    },
    timezone: { type: String, default: "UTC" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const User = models.User || model("User", userSchema);