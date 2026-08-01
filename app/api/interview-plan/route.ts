import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Job } from "../../../lib/types";
import { DURATION_PACING, DurationMinutes, DifficultyLevel } from "../../../lib/prompts";
import { buildFallbackPlan, isValidPlan } from "../../../lib/plan";
import { FALLBACK_JOB } from "../../../lib/fallbackJob";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let job: Job = FALLBACK_JOB;
  let duration: DurationMinutes = 5;
  let surprise = true;
  try {
    const body = (await req.json()) as {
      job?: Job;
      duration?: DurationMinutes;
      level?: DifficultyLevel;
      surprise?: boolean;
      cv?: string;
    };
    if (body.job?.role) job = body.job;
    if (body.duration && DURATION_PACING[body.duration]) duration = body.duration;
    surprise = body.surprise !== false;
    const level = body.level ?? "medium";
    const count = DURATION_PACING[duration].questions;

    const cvNote = body.cv
      ? `\nCandidate CV excerpt: """${body.cv.slice(0, 1200)}""" At least one question must probe a specific claim from this CV.`
      : "";
    const curveballNote = surprise
      ? `Also pick one curveballTopic: a short phrase naming an unexpected but realistic angle a real ${job.company} interviewer could hit (business model, a hard trade-off, the market).`
      : "Set curveballTopic to null.";

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You design a phone screen interview plan for a recruiter. Difficulty: ${level}. Return ONLY JSON with exactly these keys: focusAreas (array of 3 short phrases: what ${job.company} really wants for this role), plannedQuestions (array of EXACTLY ${count} objects with keys "question" and "why"; "question" is what the recruiter will ask, "why" is one short line explaining why it will be asked, max 12 words), curveballTopic (short phrase or null), whatGoodLooksLike (array of 3 short concrete lines describing a strong performance). ${curveballNote} Questions must be specific to the role and company, ordered like a real screen: opener first, closer last.`,
        },
        {
          role: "user",
          content: `Company: ${job.company}\nRole: ${job.role} (${job.seniority})\nTop requirements: ${job.top5Requirements.join(", ")}\nCulture: ${job.cultureHints}${cvNote}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    if (parsed.curveballTopic === null) delete parsed.curveballTopic;
    if (!surprise) delete parsed.curveballTopic;
    if (Array.isArray(parsed.plannedQuestions)) {
      parsed.plannedQuestions = parsed.plannedQuestions.slice(0, count);
    }
    if (isValidPlan(parsed)) return NextResponse.json(parsed);
    return NextResponse.json(buildFallbackPlan(job, duration, surprise));
  } catch {
    return NextResponse.json(buildFallbackPlan(job, duration, surprise));
  }
}
