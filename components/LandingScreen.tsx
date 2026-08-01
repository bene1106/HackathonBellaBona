"use client";

import NotificationCard from "./NotificationCard";

export default function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen-in relative flex flex-1 flex-col overflow-hidden px-6 pb-8 pt-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[8%] h-72 w-72 -translate-x-1/2 rounded-full bg-accept/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accept" />
        <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-paper/60">
          ColdCall
        </span>
      </div>

      <div className="relative z-10 mt-12 space-y-3">
        <div className="card-drop" style={{ animationDelay: "0.3s" }}>
          <NotificationCard
            avatar={
              <span className="relative flex h-full w-full items-center justify-center rounded-xl bg-accept/15 text-accept">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
                </svg>
              </span>
            }
            title="Bella&Bona Recruiting"
            body="Incoming call · mobile"
            meta="now"
          />
        </div>
        <div className="card-drop" style={{ animationDelay: "0.9s" }}>
          <NotificationCard
            avatar={
              <span className="flex h-full w-full items-center justify-center rounded-xl bg-paper/10 font-display text-sm font-bold text-paper">
                82
              </span>
            }
            title="Interview scored"
            body="Almost ready. Two fixes before the next round."
            meta="4m"
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <h1 className="font-display text-[2.7rem] font-bold leading-[1.06]">
          Your phone is
          <br />
          about to ring.
        </h1>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-paper/60">
          A recruiter grills you on the real job, scores every answer, and calls
          back until you are ready.
        </p>

        <button
          onClick={onStart}
          className="mt-8 w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
        >
          Get prepared
        </button>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-paper/35">
          No signup · no app · real pressure
        </p>
      </div>
    </div>
  );
}
