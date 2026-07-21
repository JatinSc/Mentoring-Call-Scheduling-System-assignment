/**
 * Database Seeding Script
 * Run: node scripts/seedDatabase.js
 * 
 * This script is idempotent - safe to run multiple times.
 * It will check for existing data and only create new records.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ==================== DUMMY DATA ====================

const CAREER_STAGES = ["Student", "Fresher", "Working Professional", "Career Switcher"];
const ROLES = ["USER", "MENTOR"];

const expertiseAreas = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "DevOps",
  "Cloud Architecture",
  "Machine Learning",
  "Data Science",
  "Product Management",
  "Agile Methodology",
  "System Design",
  "Database Management",
  "Cybersecurity",
  "Mobile Development",
  "UI/UX Design",
  "Quality Assurance",
  "Project Management",
];

const skillsList = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Figma",
  "Adobe XD",
  "SEO",
  "Content Writing",
  "Public Speaking",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Team Management",
];

const interestsList = [
  "Coding",
  "Design",
  "Open Source",
  "Contributing",
  "Mentoring",
  "Blogging",
  "Reading",
  "Sports",
  "Gaming",
  "Travel",
  "Music",
  "Art",
  "Photography",
  "Teaching",
  "Writing",
  "Podcasting",
];

const companyNames = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "Spotify",
  "IBM",
  "Oracle",
  "Salesforce",
  "Adobe",
  "PayPal",
  "Uber",
  "Airbnb",
  "GitHub",
  "Stripe",
  "Slack",
  "Zoom",
  "Twitter",
  "LinkedIn",
];

const designationNames = [
  "Senior Software Engineer",
  "Software Engineer",
  "Lead Developer",
  "Engineering Manager",
  "Product Manager",
  "Technical Lead",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "QA Lead",
  "Project Manager",
  "Solutions Architect",
  "Security Engineer",
  "Mobile Developer",
  "Database Administrator",
];

// ==================== HELPER FUNCTIONS ====================

const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateBio = (name, isMentor = false) => {
  const bios = isMentor ? [
    `Experienced professional with over ${getRandomNumber(5, 15)} years in the industry. Passionate about mentoring and helping others grow.`,
    `Senior developer and mentor with a strong background in ${getRandomItem(expertiseAreas)}. I love sharing knowledge and guiding new talent.`,
    `Tech enthusiast with ${getRandomNumber(3, 12)} years of experience. I believe in learning by doing and helping others achieve their goals.`,
    `Seasoned professional with expertise in ${getRandomItem(expertiseAreas)} and ${getRandomItem(expertiseAreas)}. Committed to fostering growth in the tech community.`,
    `Innovative problem solver with a passion for ${getRandomItem(interestsList)}. I enjoy mentoring and helping others navigate their career paths.`,
  ] : [
    `Aspiring ${getRandomItem(['developer', 'designer', 'engineer', 'enthusiast', 'creator'])} with a passion for ${getRandomItem(skillsList)} and ${getRandomItem(interestsList)}.`,
    `Curious learner exploring the world of ${getRandomItem(['technology', 'design', 'development', 'innovation'])}.`,
    `Passionate about ${getRandomItem(interestsList)} and always looking to learn new things.`,
    `Enthusiastic ${getRandomItem(['developer', 'designer', 'creator', 'problem-solver'])} on a journey to make a difference.`,
    `Love building things and solving problems. Interested in ${getRandomItem(expertiseAreas)} and ${getRandomItem(expertiseAreas)}.`,
  ];
  return getRandomItem(bios);
};

// ==================== GENERATE USERS ====================

const generateUsers = (count = 10) => {
  const users = [];
  const names = [
    "Aarav Sharma", "Priya Patel", "Rahul Singh", "Sneha Reddy", "Vikram Kumar",
    "Ananya Joshi", "Arjun Nair", "Meera Iyer", "Karan Malhotra", "Divya Menon",
    "Rohan Gupta", "Neha Kapoor", "Siddharth Mehta", "Kavya Nair", "Aditya Rao",
  ];

  for (let i = 0; i < count; i++) {
    const firstName = names[i % names.length].split(" ")[0];
    const lastName = names[i % names.length].split(" ")[1];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(1, 999)}@example.com`;

    users.push({
      name,
      email,
      password: "password123", // Will be hashed
      role: "USER",
      bio: generateBio(name, false),
      company: Math.random() > 0.5 ? getRandomItem(companyNames) : "",
      designation: Math.random() > 0.5 ? getRandomItem(designationNames) : "",
      experience: getRandomNumber(0, 10),
      expertise: getRandomItems(expertiseAreas, getRandomNumber(1, 4)),
      tags: getRandomItems(skillsList, getRandomNumber(2, 5)),
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      careerStage: getRandomItem(CAREER_STAGES),
      targetRole: getRandomItem(designationNames),
      skills: getRandomItems(skillsList, getRandomNumber(3, 6)),
      interests: getRandomItems(interestsList, getRandomNumber(2, 5)),
      goals: `I want to ${getRandomItem(['become a', 'learn', 'master', 'excel in'])} ${getRandomItem(expertiseAreas)} within the next ${getRandomNumber(1, 3)} years.`,
      timezone: "UTC",
    });
  }
  return users;
};

// ==================== GENERATE MENTORS ====================

const generateMentors = (count = 5) => {
  const mentors = [];
  const mentorNames = [
    "Dr. Anjali Desai", "Prof. Rajesh Iyer", "Suman Reddy", "Rakesh Nair", "Aruna Kiran",
    "Prakash Rao", "Lakshmi Pandey", "Vijay Kumar", "Sara Thomas", "Naveen Singh",
  ];

  for (let i = 0; i < count; i++) {
    const name = mentorNames[i % mentorNames.length];
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || name.split(" ")[2] || "Mentor";
    const email = `mentor.${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(1, 99)}@mentor.com`;

    mentors.push({
      name,
      email,
      password: "mentor123", // Will be hashed
      role: "MENTOR",
      bio: generateBio(name, true),
      company: getRandomItem(companyNames),
      designation: getRandomItem(designationNames),
      experience: getRandomNumber(5, 20),
      expertise: getRandomItems(expertiseAreas, getRandomNumber(3, 6)),
      tags: getRandomItems(skillsList, getRandomNumber(4, 8)),
      linkedin: `https://linkedin.com/in/mentor.${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      careerStage: "Working Professional",
      targetRole: getRandomItem(designationNames),
      skills: getRandomItems(skillsList, getRandomNumber(5, 10)),
      interests: getRandomItems(interestsList, getRandomNumber(3, 7)),
      goals: `I want to mentor and ${getRandomItem(['guide', 'inspire', 'teach', 'support'])} the next generation of ${getRandomItem(['developers', 'designers', 'engineers', 'leaders'])}.`,
      timezone: "UTC",
    });
  }
  return mentors;
};

// ==================== SEED DATABASE ====================

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not found in environment variables");
  }
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  // Check if data already exists
  const existingUsers = await User.find({ role: "USER" });
  const existingMentors = await User.find({ role: "MENTOR" });

  console.log(`📊 Current database state:`);
  console.log(`   - ${existingUsers.length} users found`);
  console.log(`   - ${existingMentors.length} mentors found\n`);

  // Generate new data
  const users = generateUsers(10);
  const mentors = generateMentors(5);

  let createdUsers = 0;
  let updatedUsers = 0;
  let createdMentors = 0;
  let updatedMentors = 0;

  // Seed Users
  console.log("👤 Creating/updating users...");
  for (const userData of users) {
    try {
      const existing = await User.findOne({ email: userData.email });
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      if (existing) {
        // Update existing user
        await User.findByIdAndUpdate(existing.id, {
          ...userData,
          password: existing.password, // Keep existing password
        });
        updatedUsers++;
      } else {
        // Create new user
        await User.create({
          ...userData,
          password: hashedPassword,
        });
        createdUsers++;
      }
    } catch (error) {
      console.error(`   ❌ Error with user ${userData.email}:`, error.message);
    }
  }
  console.log(`   ✅ ${createdUsers} users created, ${updatedUsers} users updated`);

  // Seed Mentors
  console.log("\n🧑‍🏫 Creating/updating mentors...");
  for (const mentorData of mentors) {
    try {
      const existing = await User.findOne({ email: mentorData.email });
      const hashedPassword = await bcrypt.hash(mentorData.password, 12);
      
      if (existing) {
        // Update existing mentor
        await User.findByIdAndUpdate(existing.id, {
          ...mentorData,
          password: existing.password, // Keep existing password
        });
        updatedMentors++;
      } else {
        // Create new mentor
        await User.create({
          ...mentorData,
          password: hashedPassword,
        });
        createdMentors++;
      }
    } catch (error) {
      console.error(`   ❌ Error with mentor ${mentorData.email}:`, error.message);
    }
  }
  console.log(`   ✅ ${createdMentors} mentors created, ${updatedMentors} mentors updated`);

  // Summary
  console.log("\n📊 Seeding Summary:");
  console.log(`   - Users: ${createdUsers} created, ${updatedUsers} updated`);
  console.log(`   - Mentors: ${createdMentors} created, ${updatedMentors} updated`);
  
  const finalUsers = await User.find({ role: "USER" });
  const finalMentors = await User.find({ role: "MENTOR" });
  console.log(`\n📈 Final database state:`);
  console.log(`   - Total users: ${finalUsers.length}`);
  console.log(`   - Total mentors: ${finalMentors.length}`);

  // Show sample users
  console.log("\n🔍 Sample users:");
  const sampleUsers = finalUsers.slice(0, 3);
  sampleUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    console.log(`      Skills: ${user.skills?.slice(0, 3).join(", ")}...`);
    console.log(`      Interests: ${user.interests?.slice(0, 3).join(", ")}...`);
  });

  console.log("\n🔍 Sample mentors:");
  const sampleMentors = finalMentors.slice(0, 3);
  sampleMentors.forEach((mentor, index) => {
    console.log(`   ${index + 1}. ${mentor.name} (${mentor.email})`);
    console.log(`      Company: ${mentor.company}`);
    console.log(`      Designation: ${mentor.designation}`);
    console.log(`      Experience: ${mentor.experience} years`);
    console.log(`      Expertise: ${mentor.expertise?.slice(0, 3).join(", ")}...`);
  });

  console.log("\n✨ Database seeding completed successfully!");
  console.log("\n🔑 Default credentials:");
  console.log(`   Users: password123`);
  console.log(`   Mentors: mentor123`);
}

// ==================== RUN SEEDING ====================

connectDB()
  .then(seedDatabase)
  .then(disconnectDB)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });