import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const sign = (userId: string, email: string) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };
    if (!email || !password || !name) { res.status(400).json({ message: "All fields required" }); return; }
    if (password.length < 6) { res.status(400).json({ message: "Password min 6 chars" }); return; }
    if (await User.findOne({ email: email.toLowerCase() })) { res.status(409).json({ message: "Email already registered" }); return; }
    const user = await User.create({ email, password, name });
    res.status(201).json({ token: sign(user._id.toString(), user.email), user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) { res.status(500).json({ message: "Registration failed" }); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) { res.status(400).json({ message: "Email and password required" }); return; }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) { res.status(401).json({ message: "Invalid credentials" }); return; }
    res.json({ token: sign(user._id.toString(), user.email), user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) { res.status(500).json({ message: "Login failed" }); }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) { res.status(500).json({ message: "Failed" }); }
};
