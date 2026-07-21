/**
 * Script to create ADMIN user(s)
 * Run: node src/scripts/seedAdmin.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { connectDatabase, disconnectDatabase } from "../lib/database.js";

// Define admins to create - add as many as needed
const ADMIN_USERS = [
  {
    email: "jatin@admin.com",
    password: "jatin1234567890",
    name: "Jatin"
  },
  // Add more admins here
  // {
  //   email: "another@admin.com",
  //   password: "anotherPassword123",
  //   name: "Another Admin"
  // }
];

async function createAdmins() {
  console.log("Starting admin creation...");

  for (const adminData of ADMIN_USERS) {
    const { email, password, name } = adminData;

    if (!email || !password) {
      console.error(`Skipping: Missing email or password for ${name || 'unnamed admin'}`);
      continue;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      // Update existing user to ADMIN role
      await User.findByIdAndUpdate(existing.id, { role: "ADMIN" });
      console.log(`✅ Updated existing user to ADMIN: ${email}`);
    } else {
      // Create new ADMIN user
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        name: name || "Admin",
        email: email.toLowerCase(),
        password: hash,
        role: "ADMIN",
        timezone: "UTC"
      });
      console.log(`✅ Created ADMIN user: ${email}`);
    }
  }

  console.log("✨ Admin creation completed!");
}

// Run the function with DB connection
connectDatabase()
  .then(createAdmins)
  .then(disconnectDatabase)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });