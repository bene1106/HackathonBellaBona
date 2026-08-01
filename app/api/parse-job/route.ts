import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { FALLBACK_JOB } from "../../../lib/fallbackJob";

export const maxDuration = 30;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { input } = (await req.json()) as { input: string };
    if (!input?.trim()) return NextResponse.json(FALLBACK_JOB);

    let text = input.trim();
    if (/^https?:\/\//i.test(text)) {
      try {
        const res = await fetch(text, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          },
          signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        const stripped = stripHtml(html);
        if (stripped.length < 200) return NextResponse.json(FALLBACK_JOB);
        text = stripped;
      } catch {
        return NextResponse.json(FALLBACK_JOB);
      }
    }

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Extract the job posting into JSON with exactly these keys: company (string), role (string), seniority (string), top5Requirements (array of 5 short strings, most important first), cultureHints (one short string). Infer missing details sensibly from context (product names, domain, tone). NEVER output placeholder values like "Unknown", "Not specified", or "N/A" — if the company is truly unnamed, use null for that field. If the text is not a job posting at all, return {"notAJob": true}. Return ONLY JSON.',
        },
        { role: "user", content: text.slice(0, 12000) },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const isPlaceholder = (s: unknown) =>
      !s || /^(unknown|not specified|unspecified|n\/?a|none|null)$/i.test(String(s).trim());

    const requirements = (Array.isArray(parsed.top5Requirements) ? parsed.top5Requirements : [])
      .map(String)
      .filter((r: string) => !isPlaceholder(r))
      .slice(0, 5);

    if (parsed.notAJob || isPlaceholder(parsed.role) || requirements.length < 2) {
      return NextResponse.json(FALLBACK_JOB);
    }
    return NextResponse.json({
      company: isPlaceholder(parsed.company) ? "Confidential" : String(parsed.company),
      role: String(parsed.role),
      seniority: isPlaceholder(parsed.seniority) ? "Mid-level" : String(parsed.seniority),
      top5Requirements: requirements,
      cultureHints: isPlaceholder(parsed.cultureHints) ? "" : String(parsed.cultureHints),
    });
  } catch {
    return NextResponse.json(FALLBACK_JOB);
  }
}
