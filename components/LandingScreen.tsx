"use client";

import NotificationCard from "./NotificationCard";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute/80">
      {children}
    </p>
  );
}

function CTA({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

const STEPS = [
  {
    n: "1",
    title: "Paste the job",
    body: "We read the real posting and build your interview plan.",
  },
  {
    n: "2",
    title: "Take the call",
    body: "Your phone rings. A recruiter asks, follows up, interrupts.",
  },
  {
    n: "3",
    title: "Get your score",
    body: "A verdict, four category scores, and the answers to fix.",
  },
];

const ROUNDS = [
  { label: "Round 1", note: "Rambled the intro", score: "54", ready: false },
  { label: "Round 2", note: "Better stories, weak numbers", score: "71", ready: false },
  { label: "Round 3", note: "Ready for the real one", score: "82", ready: true },
];

export default function LandingScreen({
  onStart,
  onMentors,
}: {
  onStart: () => void;
  onMentors: () => void;
}) {
  return (
    <div className="screen-in flex flex-1 flex-col px-6 pb-10 pt-12">
      {/* Hero */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accept" />
        <Eyebrow>CallMeJob</Eyebrow>
      </div>

      <h1 className="mt-8 font-display text-[2.7rem] font-bold leading-[1.06]">
        Your phone is
        <br />
        about to ring.
      </h1>
      <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-mute">
        Interview nerves come from never facing real pressure. CallMeJob is a
        recruiter who calls you, grills you on the actual job, and scores every
        answer.
      </p>

      <div className="mt-7">
        <CTA onClick={onStart}>Get prepared</CTA>
        <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-mute/70">
          No signup · no app · works in your browser
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div className="card-drop" style={{ animationDelay: "0.3s" }}>
          <NotificationCard
            avatar={
              <span className="flex h-full w-full items-center justify-center rounded-xl bg-accept/15 text-deep">
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
            avatar={<span>82</span>}
            title="Interview scored"
            body="Almost ready. Two fixes before the next round."
            meta="4m"
          />
        </div>
      </div>

      {/* How it works */}
      <section className="mt-14">
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-4 space-y-2.5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="lift flex items-start gap-3 rounded-[20px] border border-line bg-card p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5 font-mono text-sm text-ink/70">
                {s.n}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-mute">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The unlimited argument */}
      <section className="mt-14">
        <Eyebrow>The math</Eyebrow>
        <h2 className="mt-3 font-display text-[1.7rem] font-bold leading-tight">
          Practice a hundred times before the one that counts.
        </h2>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-mute">
          A human mock interview costs real money and you get exactly one shot.
          CallMeJob calls you again and again, scoring every round, until the
          verdict says READY.
        </p>
        <div className="lift mt-5 space-y-4 rounded-[20px] border border-line bg-card p-5">
          {ROUNDS.map((r) => (
            <div key={r.label} className="flex items-baseline gap-3">
              <span className="w-16 shrink-0 font-mono text-[12px] uppercase tracking-wide text-mute/80">
                {r.label}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-mute">
                {r.note}
              </span>
              <span
                className={`font-display text-lg font-bold tabular-nums ${
                  r.ready ? "text-deep" : "text-ink"
                }`}
              >
                {r.score}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* For mentors */}
      <section className="mt-14 rounded-[20px] border border-line bg-ink/[0.03] p-5">
        <Eyebrow>For mentors</Eyebrow>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">
          Stop teaching lesson one. CallMeJob sends you candidates who are
          already READY, so your paid hour is the final exam.
        </p>
        <button
          onClick={onMentors}
          className="mt-3 text-sm font-semibold text-deep underline decoration-deep/30 underline-offset-4"
        >
          Mentor with us
        </button>
      </section>

      {/* Closing */}
      <section className="mt-14">
        <h2 className="text-center font-display text-[1.7rem] font-bold leading-tight">
          Ready to pick up?
        </h2>
        <div className="mt-5">
          <CTA onClick={onStart}>Get prepared</CTA>
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-mute/70">
          Built for the call you cannot rehearse
        </p>
      </section>
    </div>
  );
}
