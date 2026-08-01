"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading the job posting…",
  "Briefing your recruiter…",
  "Dialing your number…",
];

export default function PrepScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      1800
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full text-accept ring-pulse">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-9 w-9"
          aria-hidden
        >
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
        </svg>
      </div>
      <p
        key={step}
        className="mt-10 font-display text-xl text-paper/90"
        aria-live="polite"
      >
        {STEPS[step]}
      </p>
    </div>
  );
}
