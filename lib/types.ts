export type Mode = "job" | "pitch";

// In pitch mode the same shape carries: company = startup name,
// role = product one-liner, seniority = stage, top5Requirements =
// topics a VC would probe, cultureHints = industry.
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

export type PlannedQuestion = {
  question: string;
  why: string;
};

export type InterviewPlan = {
  focusAreas: string[];
  plannedQuestions: PlannedQuestion[];
  curveballTopic?: string;
  whatGoodLooksLike: string[];
};

export type Screen =
  | "landing"
  | "home"
  | "prep"
  | "plan"
  | "notify"
  | "incoming"
  | "live"
  | "feedback"
  | "video"
  | "mentor";
