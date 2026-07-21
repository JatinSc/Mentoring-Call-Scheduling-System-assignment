import { env } from "./env.js";

import mongoose from "mongoose";


import { AvailabilityTemplate } from "../models/AvailabilityTemplate.model.js";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  console.log(uri, "URI")
  if (!uri) throw new Error("MONGODB_URI is required");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  try {
    await AvailabilityTemplate.syncIndexes();
  } catch (err) {
    console.warn("AvailabilityTemplate syncIndexes notice:", err.message);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
