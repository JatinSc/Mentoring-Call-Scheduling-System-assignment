import { Router } from "express";
import {
  listUsers,
  listMentors,
  updateMentorMetadata,
  createUser,
  getAvailabilityForUser,
  getOverlappingSlots,
  scheduleMeeting,
  getRecommendations,
} from "../controllers/adminController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(requireRole("ADMIN"));

adminRoutes.get("/users", listUsers);
adminRoutes.get("/mentors", listMentors);
adminRoutes.put("/mentors/:mentorId", updateMentorMetadata);
adminRoutes.post("/create-user", createUser);
adminRoutes.get("/availability/:userId", getAvailabilityForUser);
adminRoutes.get("/availability/:userId/overlap", getOverlappingSlots);
adminRoutes.post("/recommendations", getRecommendations);
adminRoutes.post("/meetings", scheduleMeeting);
