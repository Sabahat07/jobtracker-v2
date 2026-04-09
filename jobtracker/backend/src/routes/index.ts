import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { getApplications, createApplication, updateApplication, deleteApplication } from "../controllers/applicationController";
import { parseJD } from "../controllers/aiController";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, getMe);

export const appRouter = Router();
appRouter.use(authenticate);
appRouter.get("/", getApplications);
appRouter.post("/", createApplication);
appRouter.put("/:id", updateApplication);
appRouter.delete("/:id", deleteApplication);

export const aiRouter = Router();
aiRouter.use(authenticate);
aiRouter.post("/parse", parseJD);
