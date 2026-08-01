import { NextRequest, NextResponse } from "next/server";
import { Job } from "../../../../lib/types";
import { buildRecruiterPrompt, buildFirstMessage } from "../../../../lib/prompts";

export const maxDuration = 30;

const API_BASE = "https://api.liveavatar.com/v1";
const SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "LiveAvatar not configured" }, { status: 501 });
  }

  try {
    const { job, difficulty } = (await req.json()) as { job: Job; difficulty: number };
    const realMode = process.env.LIVEAVATAR_REAL === "true" || process.env.LIVEAVATAR_REAL === "1";
    const headers = { "X-API-KEY": apiKey, "content-type": "application/json" };

    const contextRes = await fetch(`${API_BASE}/contexts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: `coldcall-${job.company}-r${difficulty}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 60),
        prompt: `${buildRecruiterPrompt(job, difficulty)} This round is a video interview, so the candidate can see you.`,
        opening_text: buildFirstMessage(job),
      }),
    });
    if (!contextRes.ok) {
      throw new Error(`context ${contextRes.status}: ${(await contextRes.text()).slice(0, 300)}`);
    }
    const contextId = (await contextRes.json()).data.id as string;

    const avatarId = realMode
      ? process.env.LIVEAVATAR_AVATAR_ID
      : SANDBOX_AVATAR_ID;
    if (!avatarId) {
      return NextResponse.json(
        { error: "LIVEAVATAR_AVATAR_ID is required in real mode" },
        { status: 501 }
      );
    }

    const persona: Record<string, string> = { context_id: contextId, language: "en" };
    if (process.env.LIVEAVATAR_VOICE_ID) persona.voice_id = process.env.LIVEAVATAR_VOICE_ID;

    const tokenRes = await fetch(`${API_BASE}/sessions/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        mode: "FULL",
        is_sandbox: !realMode,
        avatar_id: avatarId,
        avatar_persona: persona,
        ...(realMode ? { max_session_duration: 600 } : {}),
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(`token ${tokenRes.status}: ${(await tokenRes.text()).slice(0, 300)}`);
    }
    const data = (await tokenRes.json()).data as { session_id: string; session_token: string };

    return NextResponse.json({ sessionToken: data.session_token, isSandbox: !realMode });
  } catch (e) {
    console.error("liveavatar session error:", e);
    return NextResponse.json({ error: "Could not start video session" }, { status: 502 });
  }
}
