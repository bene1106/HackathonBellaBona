"use client";

import { Mode } from "../lib/types";

export default function ResearchScreen({
  step,
  company,
  mode = "job",
}: {
  step: number;
  company: string | null;
  mode?: Mode;
}) {
  const steps =
    mode === "pitch"
      ? [
          "Reading your pitch",
          company ? `Finding the hard questions for ${company}` : "Finding the hard questions",
          "Designing your pitch plan",
        ]
      : [
          "Reading the job posting",
          company ? `Extracting what ${company} really wants` : "Extracting what they really want",
          "Designing your interview plan",
        ];

  return (
    <div className="screen-in flex flex-1 flex-col justify-center px-8">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full text-deep ring-pulse">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-9 w-9"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <h1 className="mt-10 text-center font-display text-2xl font-bold leading-snug">
        Building your
        <br />
        {mode === "pitch" ? "pitch plan." : "interview plan."}
      </h1>

      <ul className="mx-auto mt-10 w-full max-w-[300px] space-y-5" aria-live="polite">
        {steps.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "next";
          return (
            <li key={i} className="flex items-center gap-3.5">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                  state === "done"
                    ? "bg-accept/15 text-deep"
                    : state === "active"
                      ? "border border-accept/60 text-deep"
                      : "border border-line text-transparent"
                }`}
              >
                {state === "done" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : state === "active" ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accept" />
                ) : null}
              </span>
              <span
                className={`text-[15px] transition-colors duration-300 ${
                  state === "done"
                    ? "text-mute/80"
                    : state === "active"
                      ? "text-ink"
                      : "text-mute/50"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
