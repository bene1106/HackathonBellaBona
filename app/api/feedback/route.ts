import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Job, TranscriptEntry } from "../../../lib/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { job, transcript, cv } = (await req.json()) as {
      job: Job;
      transcript: TranscriptEntry[];
      cv?: string;
    };

    if (!transcript?.length || !transcript.some((t) => t.speaker === "candidate")) {
      return NextResponse.json({ error: "transcript too short" }, { status: 422 });
    }

    const transcriptText = transcript
      .map((t) => `${t.speaker === "recruiter" ? "Recruiter" : "Candidate"}: ${t.text}`)
      .join("\n");

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a tough but fair interview coach. Given this job spec and interview transcript, return ONLY JSON: score (0-100, be honest, average first attempts land 45-65), verdict ('NOT READY'|'ALMOST'|'READY', READY only at 80+), categories (object with clarity, structure, confidence, accuracy — each 0-100; accuracy measures how specific and credible their claims were" +
            (cv ? ", checked against their CV" : "") +
            "), strengths (array of 3 short bullets referencing what they actually said), improvements (array of 3 specific, actionable fixes with a better example phrasing), oneLineSummary (string).",
        },
        {
          role: "user",
          content: `JOB SPEC:\n${JSON.stringify(job)}\n${cv ? `\nCANDIDATE CV:\n${cv.slice(0, 2000)}\n` : ""}\nTRANSCRIPT:\n${transcriptText}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const verdict =
      score >= 80 ? "READY" : ["NOT READY", "ALMOST", "READY"].includes(parsed.verdict) ? parsed.verdict : score >= 60 ? "ALMOST" : "NOT READY";

    const clamp = (v: unknown) => Math.max(0, Math.min(100, Number(v) || 0));
    return NextResponse.json({
      score,
      verdict: score >= 80 ? "READY" : verdict === "READY" ? "ALMOST" : verdict,
      categories: {
        clarity: clamp(parsed.categories?.clarity),
        structure: clamp(parsed.categories?.structure),
        confidence: clamp(parsed.categories?.confidence),
        accuracy: clamp(parsed.categories?.accuracy),
      },
      strengths: (parsed.strengths ?? []).slice(0, 3).map(String),
      improvements: (parsed.improvements ?? []).slice(0, 3).map(String),
      oneLineSummary: String(parsed.oneLineSummary ?? ""),
    });
  } catch {
    return NextResponse.json({ error: "feedback failed" }, { status: 500 });
  }
}
