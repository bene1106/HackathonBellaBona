"use client";

import { useEffect, useState } from "react";
import NotificationCard from "./NotificationCard";
import { Mode } from "../lib/types";
import { RECRUITER_NAME, PARTNER_NAME } from "../lib/prompts";

function PhoneAvatar() {
  return (
    <span className="flex h-full w-full items-center justify-center rounded-xl bg-accept/15 text-deep">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
      </svg>
    </span>
  );
}

export default function NotifyScreen({
  mode = "job",
  onDone,
}: {
  mode?: Mode;
  onDone: () => void;
}) {
  const caller = mode === "pitch" ? PARTNER_NAME : RECRUITER_NAME;
  const [now, setNow] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {}
    onDone();
  };

  const time = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div className="screen-in relative flex flex-1 flex-col overflow-hidden px-6 pb-8 pt-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[6%] h-64 w-64 -translate-x-1/2 rounded-full bg-accept/10 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center">
        <p className="font-mono text-[13px] text-mute">{date}</p>
        <p className="mt-1 font-display text-6xl font-bold tabular-nums text-ink">
          {time}
        </p>
      </div>

      <div className="relative z-10 mt-10 space-y-3">
        <div className="card-drop" style={{ animationDelay: "0.3s" }}>
          <NotificationCard
            avatar={<PhoneAvatar />}
            title="CallMeJob"
            body={`${caller} tried to call you. Tap to call back.`}
            meta="now"
          />
        </div>
        <div className="card-drop" style={{ animationDelay: "0.8s" }}>
          <NotificationCard
            avatar={<PhoneAvatar />}
            title="CallMeJob"
            body={
              mode === "pitch"
                ? "You are 12 points from FUNDABLE. Next call is coming."
                : "You are 12 points from READY. Next call is coming."
            }
            meta="2h"
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto text-center">
        <h1 className="mx-auto max-w-[16ch] font-display text-3xl font-bold leading-tight">
          Your recruiter calls when you least expect it.
        </h1>
        <p className="mx-auto mt-3 max-w-[30ch] text-sm leading-relaxed text-mute">
          Real interviews are not scheduled around you. Neither are ours.
        </p>
        <button
          onClick={enable}
          disabled={busy}
          className="mt-8 w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98] disabled:opacity-60"
        >
          Turn on notifications
        </button>
        <button onClick={onDone} className="mt-4 w-full text-center text-sm text-mute">
          Not now
        </button>
      </div>
    </div>
  );
}
