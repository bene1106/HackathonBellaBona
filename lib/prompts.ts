import { Job, InterviewPlan, Mode } from "./types";

export const RECRUITER_NAME = "Alex Weber";
export const PARTNER_NAME = "Maya Chen";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type DurationMinutes = 1 | 5 | 10 | 30 | 60;

export type InterviewOptions = {
  cv?: string;
  surprise?: boolean;
  level?: DifficultyLevel;
  duration?: DurationMinutes;
  plan?: InterviewPlan;
  redoQuestion?: string;
  mode?: Mode;
  fund?: string;
};

const FUND_TABLE: [RegExp, string][] = [
  [/food|restaurant|lunch|meal|kitchen|grocer/i, "Harvest Row"],
  [/fin|bank|pay|ledger|invest|insur/i, "Ledgerpoint"],
  [/health|med|care|bio|pharma/i, "Vital North"],
  [/climate|energy|carbon|green|solar/i, "Stillwater"],
  [/ai|data|software|saas|dev|cloud/i, "Loopstack"],
  [/commerce|retail|shop|market|consumer/i, "Cartwheel"],
  [/travel|mobility|transport|logistic|fleet/i, "Waypoint"],
  [/edu|learn|school|talent|hiring/i, "Chalkline"],
];

export function fundNameFor(industry: string): string {
  for (const [re, name] of FUND_TABLE) {
    if (re.test(industry)) return `${name} Ventures`;
  }
  return "Northlane Ventures";
}

export const DURATION_PACING: Record<
  DurationMinutes,
  { questions: number; pacing: string }
> = {
  1: {
    questions: 1,
    pacing:
      "This is a 1-minute rapid-fire screen. Ask exactly 1 question, listen to the answer, then close immediately.",
  },
  5: {
    questions: 4,
    pacing:
      "This is a 5-minute screen. Ask exactly 4 questions, one at a time, keeping the pace brisk.",
  },
  10: {
    questions: 7,
    pacing:
      "This is a 10-minute screen. Ask 6 to 7 questions and use short follow-ups when an answer is vague.",
  },
  30: {
    questions: 10,
    pacing:
      "This is a 30-minute full behavioral round. Ask about 10 questions with follow-ups, digging into concrete situations and results.",
  },
  60: {
    questions: 14,
    pacing:
      "This is a 1-hour deep dive. Ask about 14 questions across background, skills, behavior and motivation, with thorough follow-ups.",
  },
};

const PITCH_LEVEL_PERSONAS: Record<DifficultyLevel, string> = {
  easy: "Call style: friendly angel investor. Encouraging, reacts warmly, asks softball versions of each question, and lets weak answers slide.",
  medium:
    "Call style: seed partner. Professional; when an answer is vague, ask one concrete follow-up before moving on.",
  hard: "Call style: skeptical Series A partner. Time-pressed, interrupts rambling with a polite but firm redirect, challenges numbers directly, and asks for evidence before accepting any claim.",
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
  const pitch = options.mode === "pitch";
  const fund = options.fund ?? "Northlane Ventures";
  const persona = (pitch ? PITCH_LEVEL_PERSONAS : LEVEL_PERSONAS)[
    options.level ?? "medium"
  ];
  const cvNote = options.cv
    ? pitch
      ? ` The founder shared their pitch script before the call: """${options.cv.slice(0, 1500)}""" Use it: probe specific claims and numbers from it.`
      : ` The candidate shared their CV before the call: """${options.cv.slice(0, 1500)}""" Use it: reference specific roles or claims from it when probing.`
    : "";

  if (options.redoQuestion) {
    if (pitch) {
      return `You are ${PARTNER_NAME}, a partner at ${fund}, calling the founder of ${job.company} back for a focused 1-minute retry on one question from your last call. Ask EXACTLY this one question, naturally rephrased in your own words: "${options.redoQuestion}". Listen to the full answer, ask one brief follow-up only if the answer is vague, then thank them, tell them that answer was stronger, and say goodbye clearly. Keep your own turns under 2 sentences. Never coach during the call. ${persona}${cvNote}`;
    }
    return `You are ${RECRUITER_NAME}, a recruiter at ${job.company}, calling the candidate back for a focused 1-minute practice round on the ${job.role} position. The candidate struggled with one question last time and wants to retry it. Ask EXACTLY this one question, naturally rephrased in your own words: "${options.redoQuestion}". Listen to the full answer, ask one brief follow-up only if the answer is vague, then thank them warmly, tell them that answer was stronger, and say goodbye clearly. Keep your own turns under 2 sentences. Never give detailed feedback during the call. ${persona}${cvNote}`;
  }

  const duration = options.duration ?? 5;
  const { pacing } = DURATION_PACING[duration];
  const timeBudget = ` You have a HARD time budget of ${duration === 60 ? "60 minutes" : `${duration} minute${duration > 1 ? "s" : ""}`} for this call. ${pacing} Track the time yourself and wrap up on schedule: if the budget is nearly spent, skip remaining questions, thank them, say the team will be in touch, and say goodbye clearly.`;

  const difficultyLabel =
    difficulty <= 1
      ? "standard first screen"
      : `round ${difficulty} — the candidate has interviewed before, so ask sharper follow-ups and dig deeper into vague answers`;

  let questionScript: string;
  const planned = options.plan?.plannedQuestions;
  if (planned && planned.length > 0) {
    const list = planned
      .map((q, i) => `(${i + 1}) ${q.question}`)
      .join(" ");
    const curveball = options.surprise && options.plan?.curveballTopic
      ? ` One of these should land as a genuine curveball about ${options.plan.curveballTopic}; deliver it without warning.`
      : "";
    questionScript = `Follow this prepared interview plan. Ask these questions in order, one at a time, waiting for each answer, phrasing them naturally in your own words: ${list}${curveball}`;
  } else if (pitch) {
    const curveball = options.surprise
      ? ", and one unannounced curveball: ask directly what kills this company"
      : "";
    questionScript = `Ask about, one at a time, waiting for each answer: the problem and who has it, the wedge versus existing solutions, traction or validation so far, and one hard question about why THIS team wins${curveball}.`;
  } else {
    const [req1, req2] = [
      job.top5Requirements[0] ?? "the core skills for the role",
      job.top5Requirements[1] ?? "teamwork under pressure",
    ];
    const question4 = options.surprise
      ? `one unexpected curveball question a real ${job.company} interviewer would ask — something the candidate cannot have rehearsed`
      : "one standard closing question about their availability and what they are looking for in their next role";
    questionScript = `Ask EXACTLY 4 questions, one at a time, waiting for the answer: (1) a short 'tell me about yourself and why ${job.company}', (2) one question probing the most important requirement: ${req1}, (3) one behavioral question relevant to ${req2}, (4) ${question4}.`;
  }

  if (pitch) {
    return `You are ${PARTNER_NAME}, a partner at ${fund}, on a first call with the founder of ${job.company} (${job.role}; stage: ${job.seniority}; industry: ${job.cultureHints}). You are a VC partner evaluating this startup, time-pressed and professional. Speak naturally with brief acknowledgments. ${questionScript} Keep your own turns under 3 sentences. Never coach during the call. After the final question, thank them, say you will discuss it with your partners, and say goodbye clearly.${timeBudget} Round: ${difficultyLabel}. ${persona}${cvNote}`;
  }

  return `You are ${RECRUITER_NAME}, a recruiter at ${job.company}, doing a first-round phone screen for the ${job.role} position. Be warm but professional and time-efficient, like a real recruiter on a tight schedule. Speak naturally with brief acknowledgments. ${questionScript} Keep your own turns under 3 sentences. Never give feedback during the call. After the final question, thank them, say the team will be in touch, and say goodbye clearly.${timeBudget} Difficulty level: ${difficultyLabel}. ${persona}${cvNote}`;
}

export function buildFirstMessage(job: Job, options: InterviewOptions = {}): string {
  if (options.mode === "pitch") {
    const fund = options.fund ?? "Northlane Ventures";
    if (options.redoQuestion) {
      return `Hi, ${PARTNER_NAME} again from ${fund} — ready to take another shot at that question?`;
    }
    return `Hi, this is ${PARTNER_NAME}, partner at ${fund}. I saw ${job.company} and have a few minutes now if you want to walk me through it.`;
  }
  if (options.redoQuestion) {
    return `Hi, ${RECRUITER_NAME} again from ${job.company} — ready to take another shot at that question?`;
  }
  return `Hi, this is ${RECRUITER_NAME} calling from ${job.company} — do you have a few minutes to talk about the ${job.role} position you applied for?`;
}
