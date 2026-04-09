export type ApplicationStatus =
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ParsedJobDescription {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface ResumeSuggestion {
  id: string;
  text: string;
}

export const COLUMNS: ApplicationStatus[] = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
];

export const COLUMN_COLORS: Record<ApplicationStatus, { bg: string; text: string; dot: string; card: string }> = {
  Applied:       { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400",   card: "border-blue-500/20" },
  "Phone Screen":{ bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "bg-amber-400",  card: "border-amber-500/20" },
  Interview:     { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400", card: "border-violet-500/20" },
  Offer:         { bg: "bg-emerald-500/10",text: "text-emerald-400",dot: "bg-emerald-400",card: "border-emerald-500/20" },
  Rejected:      { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400",    card: "border-red-500/20" },
};
