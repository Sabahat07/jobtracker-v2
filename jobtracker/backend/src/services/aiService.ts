import OpenAI from "openai";
import { ParsedJobDescription, ResumeSuggestion } from "../types";

const client = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey });
};

export const parseJobDescription = async (jd: string): Promise<ParsedJobDescription> => {
  const res = await client().chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract job info and return ONLY this JSON:
{
  "company": "string",
  "role": "string", 
  "requiredSkills": ["array"],
  "niceToHaveSkills": ["array"],
  "seniority": "string",
  "location": "string"
}`,
      },
      { role: "user", content: `Parse this job description:\n\n${jd}` },
    ],
    max_tokens: 600,
    temperature: 0.1,
  });

  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response");
  const parsed = JSON.parse(content) as ParsedJobDescription;
  return {
    company: parsed.company || "Unknown",
    role: parsed.role || "Unknown Role",
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
    seniority: parsed.seniority || "",
    location: parsed.location || "",
  };
};

export const generateResumeSuggestions = async (
  job: ParsedJobDescription
): Promise<ResumeSuggestion[]> => {
  const skills = [...job.requiredSkills, ...job.niceToHaveSkills].slice(0, 8).join(", ");
  const res = await client().chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate resume bullet points. Return ONLY: {"suggestions": ["bullet1","bullet2","bullet3","bullet4","bullet5"]}
Each bullet: strong action verb, specific metric, tailored to role.`,
      },
      {
        role: "user",
        content: `Role: ${job.role} at ${job.company}\nSeniority: ${job.seniority}\nSkills: ${skills}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response");
  const parsed = JSON.parse(content) as { suggestions: string[] };
  return parsed.suggestions.slice(0, 5).map((text, i) => ({
    id: `s-${Date.now()}-${i}`,
    text,
  }));
};
