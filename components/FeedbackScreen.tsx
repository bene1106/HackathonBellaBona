"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import { Job, TranscriptEntry, Feedback } from "../lib/types";

const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL;

function ShareQR() {
  const [url, setUrl] = useState(PUBLIC_URL ?? "");

  useEffect(() => {
    if (!PUBLIC_URL && window.location.protocol === "https:") {
      setUrl(window.location.origin);
    }
  }, []);

  if (!url) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <div className="rounded-lg bg-paper p-1.5">
        <QRCodeSVG value={url} size={56} bgColor="#F5F3EE" fgColor="#0B1020" />
      </div>
      <p className="max-w-[18ch] text-xs leading-snug text-paper/50">
        Try it on your own phone. Scan to get the call.
      </p>
    </div>
  );
}

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
  const color = score >= 80 ? "#2FD672" : score >= 60 ? "#F5F3EE" : "#FF4B4B";

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

function CategoryBars({ feedback }: { feedback: Feedback }) {
  const entries: [string, number][] = [
    ["Clarity", feedback.categories.clarity],
    ["Structure", feedback.categories.structure],
    ["Confidence", feedback.categories.confidence],
    ["Accuracy", feedback.categories.accuracy],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-3">
      {entries.map(([label, value], i) => (
        <div key={label}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-paper/60">{label}</span>
            <span className="text-xs tabular-nums text-paper/80">{value}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper/10">
            <div
              className="h-full origin-left rounded-full"
              style={{
                width: `${value}%`,
                backgroundColor: value >= 80 ? "#2FD672" : value >= 60 ? "#F5F3EE" : "#FF4B4B",
                animation: `bar-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.9 + i * 0.12}s both`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedbackScreen({
  job,
  transcript,
  cv,
  feedback,
  setFeedback,
  onCallAgain,
  onVideoRound,
  onNewJob,
  onMentor,
}: {
  job: Job;
  transcript: TranscriptEntry[];
  cv?: string;
  feedback: Feedback | null;
  setFeedback: (f: Feedback) => void;
  onCallAgain: () => void;
  onVideoRound: () => void;
  onNewJob: () => void;
  onMentor: () => void;
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
          body: JSON.stringify({ job, transcript, cv }),
        });
        if (!res.ok) throw new Error();
        setFeedback((await res.json()) as Feedback);
      } catch {
        setError(true);
      }
    })();
  }, [feedback, job, transcript, cv, setFeedback]);

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
      <div className="screen-in flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <p className="font-display text-2xl">Couldn&apos;t score that call.</p>
        <p className="text-sm text-paper/60">
          The call may have been too short to grade. Take the call again and answer at
          least one question.
        </p>
        <button
          onClick={onCallAgain}
          className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink"
        >
          Call me again
        </button>
        <button
          onClick={onVideoRound}
          className="w-full rounded-full border border-accept/40 py-3.5 font-display text-base text-accept"
        >
          Round 2: Video interview
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
    <div className="screen-in flex flex-1 flex-col px-6 pb-10 pt-12">
      <div className="flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.25em] text-paper/50">
          {job.role} · {job.company}
        </p>
        <div className="mt-6">
          <ScoreRing score={feedback.score} />
        </div>
        <span
          className={`badge-pop mt-5 rounded-full border px-4 py-1.5 font-display text-sm font-semibold tracking-wide ${verdictStyle}`}
        >
          {feedback.verdict}
        </span>
        <p className="mt-4 max-w-[38ch] text-center text-sm leading-relaxed text-paper/70">
          {feedback.oneLineSummary}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="rounded-[20px] bg-paper/5 p-4">
          <CategoryBars feedback={feedback} />
        </div>

        <section className="rounded-[20px] bg-paper/5 p-4">
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

        <section className="rounded-[20px] bg-paper/5 p-4">
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
        {feedback.verdict === "READY" && (
          <button
            onClick={onMentor}
            className="w-full rounded-[20px] border border-accept/40 bg-accept/[0.07] p-4 text-left transition active:scale-[0.98]"
          >
            <span className="block font-display text-base font-semibold text-paper">
              Ready is just the start.
            </span>
            <span className="mt-1 block text-sm text-paper/60">
              Talk to someone who got this exact job.
            </span>
            <span className="mt-2 block text-sm font-semibold text-accept">
              Meet your mentor
            </span>
          </button>
        )}
        <button
          onClick={onCallAgain}
          className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
        >
          Call me again
        </button>
        <button
          onClick={onVideoRound}
          className="w-full rounded-full border border-accept/40 py-3.5 font-display text-base text-accept transition active:scale-[0.98]"
        >
          Round 2: Video interview
        </button>
        <button
          onClick={onNewJob}
          className="w-full rounded-full border border-paper/20 py-3.5 font-display text-base text-paper/80 transition active:scale-[0.98]"
        >
          New job
        </button>
        {feedback.verdict !== "READY" && (
          <button
            onClick={onMentor}
            className="w-full text-center text-sm text-paper/50"
          >
            Talk to someone who got this job
          </button>
        )}
        <ShareQR />
      </div>
    </div>
  );
}
