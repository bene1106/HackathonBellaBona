"use client";

import { useState } from "react";

export default function HomeScreen({
  onSubmit,
}: {
  onSubmit: (input: string) => void;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-10 pt-16">
      <div>
        <p className="font-display text-sm uppercase tracking-[0.3em] text-accept">
          ColdCall
        </p>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05]">
          Your phone is about to ring.
        </h1>
        <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-paper/70">
          Paste a job posting. A recruiter calls you for a real phone screen,
          scores you, and calls again until you&apos;re ready.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste job posting link or text"
          rows={4}
          className="w-full resize-none rounded-2xl border border-paper/15 bg-paper/5 p-4 text-base text-paper placeholder:text-paper/40 focus:border-accept/60 focus:outline-none"
        />
        <button
          onClick={() => onSubmit(input.trim())}
          disabled={!input.trim()}
          className="w-full rounded-2xl bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          Get the call
        </button>
        <p className="text-center text-xs text-paper/40">
          No login. No setup. Just answer the phone.
        </p>
      </div>
    </div>
  );
}
