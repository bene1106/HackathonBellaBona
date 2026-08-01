import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Job, Mode } from "../../../lib/types";
import { DURATION_PACING, DurationMinutes, DifficultyLevel } from "../../../lib/prompts";
import { buildFallbackPlan, isValidPlan } from "../../../lib/plan";
import { FALLBACK_JOB } from "../../../lib/fallbackJob";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let job: Job = FALLBACK_JOB;
  let duration: DurationMinutes = 5;
  let surprise = true;
  let mode: Mode = "job";
  try {
    const body = (await req.json()) as {
      job?: Job;
      duration?: DurationMinutes;
      level?: DifficultyLevel;
      surprise?: boolean;
      cv?: string;
      mode?: Mode;
    };
    if (body.job?.role) job = body.job;
    if (body.duration && DURATION_PACING[body.duration]) duration = body.duration;
    surprise = body.surprise !== false;
    if (body.mode === "pitch") mode = "pitch";
    const pitch = mode === "pitch";
    const level = body.level ?? "medium";
    const count = DURATION_PACING[duration].questions;

    const cvNote = body.cv
      ? pitch
        ? `\nFounder pitch script excerpt: """${body.cv.slice(0, 1200)}""" At least one question must probe a specific claim or number from this script.`
        : `\nCandidate CV excerpt: """${body.cv.slice(0, 1200)}""" At least one question must probe a specific claim from this CV.`
      : "";
    const curveballNote = surprise
      ? pitch
        ? `Also pick one curveballTopic: the sharpest "what kills this company" angle for this specific startup, as a short phrase.`
        : `Also pick one curveballTopic: a short phrase naming an unexpected but realistic angle a real ${job.company} interviewer could hit (business model, a hard trade-off, the market).`
      : "Set curveballTopic to null.";

    const systemPrompt = pitch
      ? `You design a first VC call plan for a partner evaluating a startup. Difficulty: ${level}. Return ONLY JSON with exactly these keys: focusAreas (array of 3 short phrases: what the VC will probe hardest about ${job.company}), plannedQuestions (array of EXACTLY ${count} objects with keys "question" and "why"; "question" is what the partner will ask, "why" is one short line explaining why it will be asked, max 12 words), curveballTopic (short phrase or null), whatGoodLooksLike (array of 3 short concrete lines describing a fundable answer). ${curveballNote} Questions must be specific to this startup and its industry, ordered like a real first call: compressed story opener first, the raise as closer.`
      : `You design a phone screen interview plan for a recruiter. Difficulty: ${level}. Return ONLY JSON with exactly these keys: focusAreas (array of 3 short phrases: what ${job.company} really wants for this role), plannedQuestions (array of EXACTLY ${count} objects with keys "question" and "why"; "question" is what the recruiter will ask, "why" is one short line explaining why it will be asked, max 12 words), curveballTopic (short phrase or null), whatGoodLooksLike (array of 3 short concrete lines describing a strong performance). ${curveballNote} Questions must be specific to the role and company, ordered like a real screen: opener first, closer last.`;

    const userPrompt = pitch
      ? `Startup: ${job.company}\nProduct: ${job.role}\nStage: ${job.seniority}\nProbe topics: ${job.top5Requirements.join(", ")}\nIndustry: ${job.cultureHints}${cvNote}`
      : `Company: ${job.company}\nRole: ${job.role} (${job.seniority})\nTop requirements: ${job.top5Requirements.join(", ")}\nCulture: ${job.cultureHints}${cvNote}`;

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    if (parsed.curveballTopic === null) delete parsed.curveballTopic;
    if (!surprise) delete parsed.curveballTopic;
    if (Array.isArray(parsed.plannedQuestions)) {
      parsed.plannedQuestions = parsed.plannedQuestions.slice(0, count);
    }
    if (isValidPlan(parsed)) return NextResponse.json(parsed);
    return NextResponse.json(buildFallbackPlan(job, duration, surprise, mode));
  } catch {
    return NextResponse.json(buildFallbackPlan(job, duration, surprise, mode));
  }
}
