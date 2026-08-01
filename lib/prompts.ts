import { Job } from "./types";

export const RECRUITER_NAME = "Alex Weber";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type InterviewOptions = {
  cv?: string;
  surprise?: boolean;
  level?: DifficultyLevel;
};

const LEVEL_PERSONAS: Record<DifficultyLevel, string> = {
  easy: "Interview style: friendly and encouraging. Ask softball versions of each question, react warmly, and let weak answers slide without pushback.",
  medium:
    "Interview style: professional. When an answer is vague, ask one brief follow-up before moving on.",
  hard: "Interview style: skeptical and time-pressed. Challenge weak or vague answers directly, interrupt rambling with a polite but firm redirect, and ask for concrete numbers or examples before accepting a claim.",
};

export function buildRecruiterPrompt(
  job: Job,
  difficulty: number,
  options: InterviewOptions = {}
): string {
  const difficultyLabel =
    difficulty <= 1
      ? "standard first screen"
      : `round ${difficulty} — the candidate has interviewed before, so ask sharper follow-ups and dig deeper into vague answers`;
  const [req1, req2] = [
    job.top5Requirements[0] ?? "the core skills for the role",
    job.top5Requirements[1] ?? "teamwork under pressure",
  ];
  const question4 = options.surprise
    ? `one unexpected curveball question a real ${job.company} interviewer would ask — something the candidate cannot have rehearsed`
    : "one standard closing question about their availability and what they are looking for in their next role";
  const persona = LEVEL_PERSONAS[options.level ?? "medium"];
  const cvNote = options.cv
    ? ` The candidate shared their CV before the call: """${options.cv.slice(0, 1500)}""" Use it: reference specific roles or claims from it when probing.`
    : "";
  return `You are ${RECRUITER_NAME}, a recruiter at ${job.company}, doing a first-round phone screen for the ${job.role} position. Be warm but professional and time-efficient, like a real recruiter on a tight schedule. Speak naturally with brief acknowledgments. Ask EXACTLY 4 questions, one at a time, waiting for the answer: (1) a short 'tell me about yourself and why ${job.company}', (2) one question probing the most important requirement: ${req1}, (3) one behavioral question relevant to ${req2}, (4) ${question4}. Keep your own turns under 3 sentences. Never give feedback during the call. After question 4, thank them, say the team will be in touch, and say goodbye clearly. Difficulty level: ${difficultyLabel}. ${persona}${cvNote}`;
}

export function buildFirstMessage(job: Job): string {
  return `Hi, this is ${RECRUITER_NAME} calling from ${job.company} — do you have a few minutes to talk about the ${job.role} position you applied for?`;
}
