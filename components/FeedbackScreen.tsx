"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Job, TranscriptEntry, Feedback } from "../lib/types";

function ScoreRing({ score }: { score: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(score);
      return;
    }
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const r = 64;
  const c = 2 * Math.PI * r;
  const good = score >= 80;
  const color = good ? "#2FD672" : score >= 60 ? "#F5F3EE" : "#FF4B4B";

  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(245,243,238,0.1)" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * shown) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold tabular-nums">{shown}</span>
        <span className="text-xs text-paper/50">/ 100</span>
      </div>
    </div>
  );
}

export default function FeedbackScreen({
  job,
  transcript,
  feedback,
  setFeedback,
  onCallAgain,
  onNewJob,
}: {
  job: Job;
  transcript: TranscriptEntry[];
  feedback: Feedback | null;
  setFeedback: (f: Feedback) => void;
  onCallAgain: () => void;
  onNewJob: () => void;
}) {
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (feedback || fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job, transcript }),
        });
        if (!res.ok) throw new Error();
        setFeedback((await res.json()) as Feedback);
      } catch {
        setError(true);
      }
    })();
  }, [feedback, job, transcript, setFeedback]);

  useEffect(() => {
    if (!feedback || feedback.verdict !== "READY") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = setTimeout(() => {
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.4 } });
    }, 1400);
    return () => clearTimeout(t);
  }, [feedback]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-display text-2xl">Couldn&apos;t score that call.</p>
        <p className="text-sm text-paper/60">
          The call may have been too short to grade. Take the call again and answer at
          least one question.
        </p>
        <button
          onClick={onCallAgain}
          className="w-full rounded-2xl bg-accept py-4 font-display text-lg font-semibold text-ink"
        >
          Call me again
        </button>
        <button onClick={onNewJob} className="text-sm text-paper/60 underline">
          New job
        </button>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full text-accept ring-pulse" />
        <p className="font-display text-xl text-paper/90">Scoring your interview…</p>
      </div>
    );
  }

  const verdictStyle =
    feedback.verdict === "READY"
      ? "bg-accept/15 text-accept border-accept/40"
      : feedback.verdict === "ALMOST"
        ? "bg-paper/10 text-paper border-paper/30"
        : "bg-decline/15 text-decline border-decline/40";

  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-12">
      <div className="flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.25em] text-paper/50">
          {job.role} · {job.company}
        </p>
        <div className="mt-6">
          <ScoreRing score={feedback.score} />
        </div>
        <span
          className={`mt-5 rounded-full border px-4 py-1.5 font-display text-sm font-semibold tracking-wide ${verdictStyle}`}
        >
          {feedback.verdict}
        </span>
        <p className="mt-4 max-w-[38ch] text-center text-sm leading-relaxed text-paper/70">
          {feedback.oneLineSummary}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-accept">
            What worked
          </h2>
          <ul className="mt-3 space-y-2.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-paper/85">
                <span className="mt-0.5 text-accept">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-paper/60">
            Fix before the next call
          </h2>
          <ul className="mt-3 space-y-2.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-paper/85">
                <span className="mt-0.5 text-paper/50">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-auto space-y-3 pt-8">
        <button
          onClick={onCallAgain}
          className="w-full rounded-2xl bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
        >
          Call me again
        </button>
        <button
          onClick={onNewJob}
          className="w-full rounded-2xl border border-paper/20 py-3.5 font-display text-base text-paper/80 transition active:scale-[0.98]"
        >
          New job
        </button>
      </div>
    </div>
  );
}
