import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import { User, Meeting } from "../models/index.js";
import { getWeekStart } from "../utils/time.js";
import { loadWeeklyAvailability, isAvailableBetween } from "../services/availabilityWeek.js";
import { isPastTime } from "../utils/time.js";
import { getMentorRecommendations } from "../services/ai.service.js";

export async function listUsers(req, res, next) {
  try {
    const users = await User.find({ role: "USER" }).sort({ name: 1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
}

export async function listMentors(req, res, next) {
  try {
    const mentors = await User.find({ role: "MENTOR" }).sort({ name: 1 });
    res.json(mentors);
  } catch (e) {
    next(e);
  }
}

export async function updateMentorMetadata(req, res, next) {
  try {
    const { mentorId } = req.params;
    const { bio, tags, expertise, company, designation, experience, linkedin } = req.body;

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== "MENTOR") {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const updates = {};
    if (typeof bio === "string") updates.bio = bio.trim();
    if (Array.isArray(tags)) {
      updates.tags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      updates.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    if (Array.isArray(expertise)) {
      updates.expertise = expertise.map((e) => String(e).trim()).filter(Boolean);
    } else if (typeof expertise === "string") {
      updates.expertise = expertise.split(",").map((e) => e.trim()).filter(Boolean);
    }
    if (typeof company === "string") updates.company = company.trim();
    if (typeof designation === "string") updates.designation = designation.trim();
    if (experience != null && !isNaN(Number(experience))) updates.experience = Number(experience);
    if (typeof linkedin === "string") updates.linkedin = linkedin.trim();

    const updated = await User.findByIdAndUpdate(mentorId, { $set: updates }, { new: true });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!role || !["USER", "MENTOR"].includes(role)) {
      return res.status(400).json({ error: "Role must be USER or MENTOR" });
    }
    const existing = await User.exists({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const displayName = name?.trim() || email.trim().split("@")[0] || "User";
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name: displayName, email: email.trim().toLowerCase(), password: hashed, role, timezone: "UTC" });
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function getAvailabilityForUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query;

    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const owner =
      user.role === "MENTOR"
        ? { userId: null, mentorId: userId, role: "MENTOR" }
        : { userId, mentorId: null, role: "USER" };

    const weekStartDate = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    weekStartDate.setUTCHours(0, 0, 0, 0);

    const result = await loadWeeklyAvailability(owner, weekStartDate);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function getOverlappingSlots(req, res, next) {
  try {
    const { userId } = req.params;
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime required" });
    }

    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const owner =
      user.role === "MENTOR"
        ? { userId: null, mentorId: userId, role: "MENTOR" }
        : { userId, mentorId: null, role: "USER" };

    const available = await isAvailableBetween(owner, startTime, endTime);
    res.json(available ? [{ userId, startTime, endTime }] : []);
  } catch (e) {
    next(e);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const { userId, callType } = req.body;

    if (!userId || !callType) {
      return res.status(400).json({
        error: "userId and callType are required",
      });
    }

    const validCallTypes = [
      "Resume Revamp",
      "Mock Interview",
      "Job Market Guidance",
    ];

    if (!validCallTypes.includes(callType)) {
      return res.status(400).json({
        error:
          "Invalid callType. Must be one of: Resume Revamp, Mock Interview, Job Market Guidance",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const mentors = await User.find({
      role: "MENTOR",
    });

    let recommendations;

    try {
      recommendations = await getMentorRecommendations(
        user,
        mentors,
        callType
      );
    } catch (err) {
      console.error("Gemini failed:", err);

      // Fallback to existing rule-based recommendation logic
      recommendations = mentors.map((mentor) => {
        let score = 0;

        // Tags match
        const userTags = user.tags || [];
        const mentorTags = mentor.tags || [];
        const commonTags = userTags.filter((tag) => mentorTags.includes(tag));
        score += commonTags.length * 10;

        // Skills/Expertise match
        const userSkills = user.skills || [];
        const mentorExpertise = mentor.expertise || [];
        const commonSkills = userSkills.filter((skill) =>
          mentorExpertise.includes(skill)
        );
        score += commonSkills.length * 15;

        // Call type specific scoring
        if (callType === "Resume Revamp") {
          if (
            mentor.company &&
            ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"].includes(
              mentor.company
            )
          ) {
            score += 30;
          }
        } else if (callType === "Job Market Guidance") {
          if (
            mentorTags.includes("Good Communication") ||
            mentorTags.includes("Communication")
          ) {
            score += 25;
          }
        } else if (callType === "Mock Interview") {
          if (commonSkills.length > 0) {
            score += 20;
          }
        }

        return {
          mentor: mentor.toObject(),
          score,
          reasons: [
            "AI quota limit reached. Recommendation generated using the rule-based matching engine."
          ],
        };
      });

      recommendations.sort((a, b) => b.score - a.score);

      // Optional: keep only top 3 to match AI response
      recommendations = recommendations.slice(0, 3);
    }

    return res.json({
      user: user.toObject(),
      callType,
      recommendations,
    });

  } catch (err) {
    next(err);
  }
}


export async function scheduleMeeting(req, res, next) {
  try {
    const adminId = req.userId;
    const { title, startTime, endTime, date, timezone, participantEmails, callType } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!callType) {
      return res.status(400).json({ error: "callType is required" });
    }

    const validCallTypes = ["Resume Revamp", "Mock Interview", "Job Market Guidance"];
    if (!validCallTypes.includes(callType)) {
      return res.status(400).json({ error: "Invalid callType. Must be one of: Resume Revamp, Mock Interview, Job Market Guidance" });
    }

    let start;
    let end;
    if (date && timezone && typeof startTime === "string" && typeof endTime === "string" && /^\d{2}:\d{2}$/.test(startTime) && /^\d{2}:\d{2}$/.test(endTime)) {
      const startDt = DateTime.fromFormat(`${date} ${startTime}`, "dd-MM-yyyy HH:mm", { zone: timezone });
      const endDt = DateTime.fromFormat(`${date} ${endTime}`, "dd-MM-yyyy HH:mm", { zone: timezone });
      if (!startDt.isValid || !endDt.isValid) {
        return res.status(400).json({ error: "Invalid date or time. Use dd-MM-yyyy and HH:mm in the selected timezone." });
      }
      start = startDt.toJSDate();
      end = endDt.toJSDate();
    } else if (startTime && endTime) {
      start = new Date(startTime);
      end = new Date(endTime);
    } else {
      return res.status(400).json({ error: "startTime and endTime are required (or date, startTime, endTime, timezone)." });
    }

    if (start >= end) {
      return res.status(400).json({ error: "endTime must be after startTime" });
    }
    if (isPastTime(start)) {
      return res.status(400).json({ error: "Cannot schedule meeting in the past" });
    }

    const emails = Array.isArray(participantEmails)
      ? participantEmails.map((e) => (typeof e === "string" ? e.trim() : "")).filter(Boolean)
      : [];

    const participants = [...new Set(emails.map((email) => email.toLowerCase()))].map((email) => ({ email }));
    const meeting = await Meeting.create({ adminId, title: title.trim(), startTime: start, endTime: end, participants, callType });
    res.status(201).json(meeting.toJSON());
  } catch (e) {
    next(e);
  }
}


// export async function getRecommendations(req, res, next) {
//   try {
//     const { userId, callType } = req.body;

//     if (!userId || !callType) {
//       return res.status(400).json({ error: "userId and callType are required" });
//     }

//     const validCallTypes = ["Resume Revamp", "Mock Interview", "Job Market Guidance"];
//     if (!validCallTypes.includes(callType)) {
//       return res.status(400).json({ error: "Invalid callType. Must be one of: Resume Revamp, Mock Interview, Job Market Guidance" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const mentors = await User.find({ role: "MENTOR" });

//     // Calculate match score for each mentor
//     const mentorsWithScores = mentors.map((mentor) => {
//       let score = 0;
//       const reasons = [];

//       // 1. Tags match
//       const userTags = user.tags || [];
//       const mentorTags = mentor.tags || [];
//       const commonTags = userTags.filter((tag) => mentorTags.includes(tag));
//       if (commonTags.length > 0) {
//         score += commonTags.length * 10;
//         reasons.push(`Matching tags: ${commonTags.join(", ")}`);
//       }

//       // 2. Skills/Expertise match
//       const userSkills = user.skills || [];
//       const mentorExpertise = mentor.expertise || [];
//       const commonSkills = userSkills.filter((skill) => mentorExpertise.includes(skill));
//       if (commonSkills.length > 0) {
//         score += commonSkills.length * 15;
//         reasons.push(`Matching skills/expertise: ${commonSkills.join(", ")}`);
//       }

//       // 3. Call type specific logic
//       if (callType === "Resume Revamp") {
//         // Prioritize mentors from big companies
//         if (mentor.company && ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"].includes(mentor.company)) {
//           score += 30;
//           reasons.push(`Big company experience: ${mentor.company}`);
//         }
//       } else if (callType === "Job Market Guidance") {
//         // Prioritize mentors with good communication tags
//         if (mentorTags.includes("Good Communication") || mentorTags.includes("Communication")) {
//           score += 25;
//           reasons.push("Strong communication skills");
//         }
//       } else if (callType === "Mock Interview") {
//         // Prioritize mentors with matching expertise
//         if (commonSkills.length > 0) {
//           score += 20; // Extra for mock interviews
//         }
//       }

//       return {
//         mentor: mentor.toObject(),
//         score,
//         reasons,
//       };
//     });

//     // Sort mentors by score descending
//     mentorsWithScores.sort((a, b) => b.score - a.score);

//     res.json({
//       user: user.toObject(),
//       callType,
//       recommendations: mentorsWithScores,
//     });
//   } catch (e) {
//     next(e);
//   }
// }
