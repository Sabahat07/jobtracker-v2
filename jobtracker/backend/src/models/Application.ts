import mongoose, { Document, Schema } from "mongoose";
import { ApplicationStatus } from "../types";

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: ApplicationStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Applied", "Phone Screen", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jdLink: { type: String },
    notes: { type: String },
    dateApplied: { type: Date, default: Date.now },
    salaryRange: { type: String },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    seniority: { type: String },
    location: { type: String },
    resumeSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
