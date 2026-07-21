// models/index.js
export { User } from "./user.model.js";
export { Availability } from "./Availability.model.js";
export { AvailabilityTemplate } from "./AvailabilityTemplate.model.js";
export { AvailabilityException } from "./AvailabilityException.model.js";
export { Meeting } from "./Meeting.model.js";


// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const { Schema, model, models } = mongoose;
// const uuid = () => uuidv4();
// const roles = ["USER", "MENTOR", "ADMIN"];

// const userSchema = new Schema(
//   {
//     _id: { type: String, default: uuid },
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: { type: String, required: true },
//     role: { type: String, enum: roles, default: "USER" },
//     bio: { type: String, default: "" },
//     company: { type: String, default: "" },
//     designation: { type: String, default: "" },
//     experience: { type: Number, default: 0 },
//     expertise: [{ type: String, default: "" }],
//     tags: [{ type: String, default: "" }],
//     linkedin: { type: String, default: "" },
//     careerStage: {
//       type: String,
//       enum: ["Student", "Fresher", "Working Professional", "Career Switcher"],
//     },
//     targetRole: {
//       type: String,
//       default: "",
//     },
//     skills: [
//       {
//         type: String,
//       },
//     ],
//     interests: [
//       {
//         type: String,
//       },
//     ],
//     goals: {
//       type: String,
//       default: "",
//     },
//     timezone: { type: String, default: "UTC" },
//   },
//   {
//     timestamps: { createdAt: "createdAt", updatedAt: false },
//     versionKey: false,
//     id: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// const availabilitySchema = new Schema(
//   {
//     _id: { type: String, default: uuid },
//     userId: { type: String, default: null, index: true },
//     mentorId: { type: String, default: null, index: true },
//     role: { type: String, enum: roles, required: true },
//     date: { type: Date, required: true, index: true },
//     startTime: { type: Date, required: true },
//     endTime: { type: Date, required: true },
//   },
//   {
//     timestamps: { createdAt: "createdAt", updatedAt: false },
//     versionKey: false,
//     id: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );
// availabilitySchema.index(
//   { userId: 1, date: 1, startTime: 1 },
//   { unique: true, partialFilterExpression: { userId: { $type: "string" } } },
// );
// availabilitySchema.index(
//   { mentorId: 1, date: 1, startTime: 1 },
//   { unique: true, partialFilterExpression: { mentorId: { $type: "string" } } },
// );

// const availabilityTemplateSchema = new Schema(
//   {
//     _id: { type: String, default: uuid },
//     userId: { type: String, default: null, unique: true, sparse: true },
//     mentorId: { type: String, default: null, unique: true, sparse: true },
//     role: { type: String, enum: roles, required: true },
//     slots: {
//       type: [{ dayOfWeek: Number, hour: Number, _id: false }],
//       default: [],
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//     id: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// const availabilityExceptionSchema = new Schema(
//   {
//     _id: { type: String, default: uuid },
//     userId: { type: String, default: null },
//     mentorId: { type: String, default: null },
//     role: { type: String, enum: roles, required: true },
//     weekStart: { type: Date, required: true },
//     dayOfWeek: { type: Number, required: true },
//     hour: { type: Number, required: true },
//     enabled: { type: Boolean, required: true },
//   },
//   {
//     timestamps: { createdAt: "createdAt", updatedAt: false },
//     versionKey: false,
//     id: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );
// availabilityExceptionSchema.index(
//   { userId: 1, weekStart: 1, dayOfWeek: 1, hour: 1 },
//   { unique: true, partialFilterExpression: { userId: { $type: "string" } } },
// );
// availabilityExceptionSchema.index(
//   { mentorId: 1, weekStart: 1, dayOfWeek: 1, hour: 1 },
//   { unique: true, partialFilterExpression: { mentorId: { $type: "string" } } },
// );

// const meetingSchema = new Schema(
//   {
//     _id: { type: String, default: uuid },
//     adminId: { type: String, required: true, index: true },
//     title: { type: String, required: true, trim: true },
//     startTime: { type: Date, required: true, index: true },
//     endTime: { type: Date, required: true },
//     participants: {
//       type: [
//         {
//           _id: { type: String, default: uuid },
//           email: { type: String, required: true },
//         },
//       ],
//       default: [],
//     },
//     callType: {
//       type: String,
//       enum: ["Resume Revamp", "Mock Interview", "Job Market Guidance"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
//       default: "Scheduled",
//     },
//     meetingNotes: {
//       type: String,
//       default: "",
//     },
//     feedback: {
//       type: String,
//       default: "",
//     },
//     rating: {
//       type: Number,
//       min: 1,
//       max: 5,
//     },
//   },
//   {
//     timestamps: { createdAt: "createdAt", updatedAt: false },
//     versionKey: false,
//     id: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// export const User = models.User || model("User", userSchema);
// export const Availability =
//   models.Availability || model("Availability", availabilitySchema);
// export const AvailabilityTemplate =
//   models.AvailabilityTemplate ||
//   model("AvailabilityTemplate", availabilityTemplateSchema);
// export const AvailabilityException =
//   models.AvailabilityException ||
//   model("AvailabilityException", availabilityExceptionSchema);
// export const Meeting = models.Meeting || model("Meeting", meetingSchema);
