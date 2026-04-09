import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { parseJobDescription, generateResumeSuggestions } from "../services/aiService";

export const parseJD = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobDescription } = req.body as { jobDescription: string };
    if (!jobDescription || jobDescription.trim().length < 50) {
      res.status(400).json({ message: "Please provide a valid job description (min 50 chars)" });
      return;
    }
    const parsed = await parseJobDescription(jobDescription.trim());
    const suggestions = await generateResumeSuggestions(parsed);
    res.json({ parsed, suggestions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI processing failed";
    res.status(500).json({ message: msg });
  }
};
