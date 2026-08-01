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

export type Feedback = {
  score: number;
  verdict: "NOT READY" | "ALMOST" | "READY";
  strengths: string[];
  improvements: string[];
  oneLineSummary: string;
};

export type Screen = "home" | "prep" | "incoming" | "live" | "feedback";
