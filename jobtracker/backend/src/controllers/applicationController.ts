import { Response } from "express";
import { Application } from "../models/Application";
import { AuthRequest } from "../middleware/auth";

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apps = await Application.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ applications: apps });
  } catch { res.status(500).json({ message: "Failed to fetch" }); }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { company, role } = req.body as { company: string; role: string };
    if (!company || !role) { res.status(400).json({ message: "Company and role required" }); return; }
    const app = await Application.create({ userId: req.user!.userId, ...req.body });
    res.status(201).json({ application: app });
  } catch { res.status(500).json({ message: "Failed to create" }); }
};

export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      req.body,
      { new: true }
    );
    if (!app) { res.status(404).json({ message: "Not found" }); return; }
    res.json({ application: app });
  } catch { res.status(500).json({ message: "Failed to update" }); }
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!app) { res.status(404).json({ message: "Not found" }); return; }
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Failed to delete" }); }
};
