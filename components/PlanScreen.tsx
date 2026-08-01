"use client";

import { Job, InterviewPlan, Mode } from "../lib/types";
import { DifficultyLevel, DurationMinutes } from "../lib/prompts";
import NotificationCard from "./NotificationCard";

const LEVEL_LABEL: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function durationLabel(d: DurationMinutes): string {
  return d === 60 ? "1 hour" : `${d} min`;
}

export default function PlanScreen({
  job,
  plan,
  level,
  duration,
  mode = "job",
  onStart,
  onAdjust,
}: {
  job: Job;
  plan: InterviewPlan;
  level: DifficultyLevel;
  duration: DurationMinutes;
  mode?: Mode;
  onStart: () => void;
  onAdjust: () => void;
}) {
  const pitch = mode === "pitch";
  return (
    <div className="screen-in flex flex-1 flex-col px-6 pb-8 pt-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute/80">
          {pitch ? "Your pitch plan" : "Your interview plan"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
          {pitch ? job.company : job.role}
        </h1>
        <p className="mt-1 text-sm text-mute">
          {pitch ? job.seniority : job.company} · {LEVEL_LABEL[level]} ·{" "}
          {durationLabel(duration)} · {plan.plannedQuestions.length}{" "}
          {plan.plannedQuestions.length === 1 ? "question" : "questions"}
        </p>
      </div>

      {pitch && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-mute/80">
          What the VC will probe
        </p>
      )}
      <div className={`${pitch ? "mt-2" : "mt-6"} flex flex-wrap gap-2`}>
        {plan.focusAreas.map((area) => (
          <span
            key={area}
            className="rounded-full border border-accept/30 bg-accept/[0.08] px-3.5 py-1.5 text-xs font-medium text-deep"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-2.5">
        {plan.plannedQuestions.map((q, i) => (
          <NotificationCard
            key={i}
            avatar={<span className="font-mono text-sm text-mute">{i + 1}</span>}
            title={q.question}
            body={q.why}
          />
        ))}
        {plan.curveballTopic && (
          <NotificationCard
            avatar={
              <span className="text-deep">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
            }
            title="One curveball, unannounced"
            body={`Expect something you cannot rehearse about ${plan.curveballTopic}.`}
          />
        )}
      </div>

      <section className="mt-6 lift rounded-[20px] border border-line bg-card p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-deep">
          What good looks like
        </h2>
        <ul className="mt-3 space-y-2">
          {plan.whatGoodLooksLike.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/85">
              <span className="mt-0.5 text-deep">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto space-y-3 pt-8">
        <button
          onClick={onStart}
          className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
        >
          Start the interview
        </button>
        <button onClick={onAdjust} className="w-full text-center text-sm text-mute">
          Adjust setup
        </button>
      </div>
    </div>
  );
}
