"use client";

import { useState } from "react";

const EXAMPLE_JOB =
  "Growth Marketing Manager at Bella&Bona in Munich. We are a food-tech startup delivering healthy office lunches. Looking for B2C growth experience, performance marketing skills, strong analytics, creativity, and German market knowledge.";

export default function HomeScreen({
  onSubmit,
}: {
  onSubmit: (input: string, cv: string, surprise: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [cv, setCv] = useState("");
  const [showCv, setShowCv] = useState(false);
  const [surprise, setSurprise] = useState(true);

  return (
    <div className="screen-in flex flex-1 flex-col justify-between px-6 pb-8 pt-16">
      <h1 className="font-display text-5xl font-bold leading-[1.05]">
        Your phone is about to ring.
      </h1>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste job posting link or text"
            rows={4}
            className="w-full resize-none rounded-2xl border border-paper/15 bg-paper/5 p-4 text-base text-paper placeholder:text-paper/40 focus:border-accept/60 focus:outline-none"
          />
          {!input && (
            <button
              onClick={() => setInput(EXAMPLE_JOB)}
              className="absolute bottom-3.5 left-3 rounded-full border border-paper/15 bg-ink px-3 py-1.5 text-xs text-paper/60 transition active:scale-95"
            >
              Try an example job
            </button>
          )}
        </div>

        {showCv ? (
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            placeholder="Paste your CV (optional) — the recruiter will probe what you claim"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-2xl border border-paper/15 bg-paper/5 p-4 text-sm text-paper placeholder:text-paper/40 focus:border-accept/60 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setShowCv(true)}
            className="text-sm text-paper/50 underline decoration-paper/30 underline-offset-4"
          >
            + Paste your CV (optional)
          </button>
        )}

        <button
          onClick={() => setSurprise((s) => !s)}
          role="switch"
          aria-checked={surprise}
          className="flex w-full items-center justify-between rounded-2xl border border-paper/10 px-4 py-3"
        >
          <span className="text-sm text-paper/70">Surprise questions</span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              surprise ? "bg-accept" : "bg-paper/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform ${
                surprise ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <button
          onClick={() => onSubmit(input.trim(), cv.trim(), surprise)}
          disabled={!input.trim()}
          className="w-full rounded-2xl bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          Get the call
        </button>
      </div>
    </div>
  );
}
