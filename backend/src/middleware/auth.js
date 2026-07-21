import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is required");

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token;

  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.userId = user.id;
    req.userRole = user.role;
    req.userEmail = user.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `This action requires one of: ${roles.join(", ")}. Your role: ${req.userRole || "none"}.`,
      });
    }
    next();
  };
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      req.userId = user.id;
      req.userRole = user.role;
      req.userEmail = user.email;
    }
  } catch {
    // An optional invalid token is treated as anonymous.
  }
  next();
}
