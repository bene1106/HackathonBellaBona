export type Job = {
  company: string;
  role: string;
  seniority: string;
  top5Requirements: string[];
  cultureHints: string;
};

export type TranscriptEntry = {
  speaker: "recruiter" | "candidate";
  text: string;
};

export type CategoryScores = {
  clarity: number;
  structure: number;
  confidence: number;
  accuracy: number;
};

export type Feedback = {
  score: number;
  verdict: "NOT READY" | "ALMOST" | "READY";
  categories: CategoryScores;
  strengths: string[];
  improvements: string[];
  oneLineSummary: string;
};

export type Screen = "home" | "prep" | "incoming" | "live" | "feedback" | "video";
