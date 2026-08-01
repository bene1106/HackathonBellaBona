"use client";

import { useState } from "react";
import NotificationCard from "./NotificationCard";

const MENTORS = [
  {
    name: "Lena Hoffmann",
    role: "PM at NovaPay, hired 2024",
    rating: "4.9",
    price: "30 min · 29 EUR",
    initials: "LH",
  },
  {
    name: "Jonas Berger",
    role: "Growth Lead at Foodora, hired 2023",
    rating: "4.8",
    price: "45 min · 39 EUR",
    initials: "JB",
  },
  {
    name: "Aylin Demir",
    role: "Data Analyst at N26, hired 2025",
    rating: "5.0",
    price: "30 min · 25 EUR",
    initials: "AD",
  },
];

export default function MentorScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState(0);
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <div className="screen-in flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accept/15 text-accept">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-8 font-display text-3xl font-bold leading-tight">
          You are on the list.
        </h1>
        <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-paper/60">
          Mentor calls open soon. We will text you when {MENTORS[selected].name}{" "}
          has a slot.
        </p>
        <button
          onClick={onBack}
          className="mt-10 w-full rounded-full border border-paper/20 py-3.5 font-display text-base text-paper/80 transition active:scale-[0.98]"
        >
          Back to your results
        </button>
      </div>
    );
  }

  return (
    <div className="screen-in flex flex-1 flex-col px-6 pb-8 pt-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/40">
          Human mentors
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-[1.08]">
          Ready is just
          <br />
          the start.
        </h1>
        <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-paper/55">
          Talk to someone who got this exact job and passed the real interview.
        </p>
      </div>

      <div className="mt-8 flex-1 space-y-2.5">
        {MENTORS.map((m, i) => (
          <div
            key={m.name}
            className={`rounded-[22px] transition ${
              selected === i ? "ring-1 ring-accept/60" : ""
            }`}
          >
            <NotificationCard
              onClick={() => setSelected(i)}
              avatar={
                <span className="flex h-full w-full items-center justify-center rounded-xl bg-accept/10 font-display text-sm font-bold text-accept">
                  {m.initials}
                </span>
              }
              title={m.name}
              body={
                <span>
                  {m.role}
                  <span className="mt-1 block font-mono text-[11px] text-paper/45">
                    ★ {m.rating} · {m.price}
                  </span>
                </span>
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={() => setJoined(true)}
          className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
        >
          Book a slot
        </button>
        <button onClick={onBack} className="w-full text-center text-sm text-paper/50">
          Back to your results
        </button>
      </div>
    </div>
  );
}
