import { Job, InterviewPlan, PlannedQuestion, Mode } from "./types";
import { DURATION_PACING, DurationMinutes } from "./prompts";

const PITCH_QUESTIONS = (company: string): PlannedQuestion[] => [
  {
    question: `Give me the two minute version: what is ${company} and why now`,
    why: "Every VC call opens with the compressed story",
  },
  {
    question: "Who has this problem and how painful is it really",
    why: "Tests whether the pain is real or invented",
  },
  {
    question: "What do people do today and why is your wedge better",
    why: "Probes the wedge versus existing solutions",
  },
  {
    question: "What traction or validation do you have so far",
    why: "Claims need numbers behind them",
  },
  {
    question: "Why is this team the one that wins this market",
    why: "The hard question every partner asks",
  },
  {
    question: "How do you make money and what are the unit economics",
    why: "Checks if the business works per unit",
  },
  {
    question: "How big can this get if it works",
    why: "Fund math needs a large outcome",
  },
  {
    question: "What have you learned from users that surprised you",
    why: "Separates builders from pitch readers",
  },
  {
    question: "What are the biggest risks in the next six months",
    why: "Tests honesty and self-awareness",
  },
  {
    question: "How much are you raising and what does it buy",
    why: "The closing question on every first call",
  },
];

const GENERIC_QUESTIONS: PlannedQuestion[] = [
  {
    question: "Walk me through a project you are genuinely proud of",
    why: "Tests depth, ownership and how you talk about results",
  },
  {
    question: "Tell me about a time something went wrong and what you did",
    why: "Failure stories reveal honesty and learning speed",
  },
  {
    question: "How do you prioritize when everything feels urgent",
    why: "Screens for structured thinking under pressure",
  },
  {
    question: "Describe a disagreement with a colleague and how it ended",
    why: "Probes conflict style and self-awareness",
  },
  {
    question: "Why are you leaving your current role",
    why: "A classic trap; recruiters listen for negativity",
  },
  {
    question: "What are you looking for in your next role",
    why: "Checks motivation and fit with the position",
  },
  {
    question: "Where do you want to be in three years",
    why: "Tests ambition and whether this role fits your path",
  },
  {
    question: "What questions do you have for us",
    why: "No questions reads as no genuine interest",
  },
];

export function buildFallbackPlan(
  job: Job,
  duration: DurationMinutes,
  surprise: boolean,
  mode: Mode = "job"
): InterviewPlan {
  const count = DURATION_PACING[duration].questions;
  if (mode === "pitch") {
    return {
      focusAreas: job.top5Requirements.slice(0, 3),
      plannedQuestions: PITCH_QUESTIONS(job.company).slice(0, count),
      curveballTopic: surprise ? "what kills this company" : undefined,
      whatGoodLooksLike: [
        "Numbers behind every traction claim",
        "A problem story a stranger could repeat",
        "A sharp answer to why this team wins",
      ],
    };
  }
  const reqQuestions: PlannedQuestion[] = job.top5Requirements.map((r) => ({
    question: `Tell me about a time you showed ${r.toLowerCase()}`,
    why: `${r} is a core requirement in the posting`,
  }));
  const pool: PlannedQuestion[] = [
    {
      question: `Tell me about yourself and why ${job.company}`,
      why: "Every screen opens here; it sets your narrative",
    },
    ...reqQuestions,
    ...GENERIC_QUESTIONS,
  ];
  return {
    focusAreas: job.top5Requirements.slice(0, 3),
    plannedQuestions: pool.slice(0, count),
    curveballTopic: surprise
      ? job.cultureHints || `how ${job.company} actually makes money`
      : undefined,
    whatGoodLooksLike: [
      "Concrete numbers behind every claim",
      "Answers under 90 seconds with a clear structure",
      `Genuine curiosity about ${job.company}`,
    ],
  };
}

export function isValidPlan(p: unknown): p is InterviewPlan {
  if (!p || typeof p !== "object") return false;
  const plan = p as InterviewPlan;
  return (
    Array.isArray(plan.focusAreas) &&
    plan.focusAreas.length >= 2 &&
    Array.isArray(plan.plannedQuestions) &&
    plan.plannedQuestions.length >= 1 &&
    plan.plannedQuestions.every(
      (q) => typeof q?.question === "string" && q.question.length > 0
    ) &&
    Array.isArray(plan.whatGoodLooksLike) &&
    plan.whatGoodLooksLike.length >= 2
  );
}
