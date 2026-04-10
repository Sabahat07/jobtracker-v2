import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";
import express from "express";
import { register, login, getMe } from "../controllers/auth";

const router = express.Router();

router.post("/register", register); // ✅ MUST
router.post("/login", login);       // ✅ MUST
router.get("/me", getMe);           // optional

export default router;
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const secret = process.env.JWT_SECRET!;
    req.user = jwt.verify(auth.split(" ")[1], secret) as JWTPayload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
