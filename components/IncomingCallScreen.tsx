"use client";

import { useEffect, useRef } from "react";
import { Job } from "../lib/types";

export default function IncomingCallScreen({
  job,
  onAccept,
  onDecline,
}: {
  job: Job;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/ringtone.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    audioRef.current = audio;

    let vibrating = true;
    const vibrate = () => {
      if (vibrating && "vibrate" in navigator) navigator.vibrate([400, 200, 400, 1000]);
    };
    vibrate();
    const id = setInterval(vibrate, 2000);

    return () => {
      vibrating = false;
      audio.pause();
      clearInterval(id);
      if ("vibrate" in navigator) navigator.vibrate(0);
    };
  }, []);

  const stopRing = () => {
    audioRef.current?.pause();
    if ("vibrate" in navigator) navigator.vibrate(0);
  };

  return (
    <div className="screen-in relative flex flex-1 flex-col items-center overflow-hidden pb-16 pt-14">
      {/* blurred dark backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[18%] h-80 w-80 -translate-x-1/2 rounded-full bg-accept/15 blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[-20%] h-72 w-72 rounded-full bg-paper/5 blur-[90px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-paper/55">
          incoming call
        </p>
        <h1 className="mt-2 px-6 text-center font-display text-[2.6rem] font-semibold leading-tight">
          {job.company}
          <span className="block text-[1.6rem] font-medium text-paper/80">Recruiting</span>
        </h1>
        <p className="mt-2 font-mono text-[13px] text-paper/45">mobile · Germany</p>
      </div>

      <div className="relative z-10 mt-auto flex h-32 w-32 items-center justify-center rounded-full border border-paper/10 bg-paper/10 shadow-[0_0_60px_rgba(47,214,114,0.15)]">
        <span className="font-display text-5xl font-bold text-paper">
          {job.company.slice(0, 1).toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 mt-auto flex w-full items-center justify-around px-10">
        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={() => {
              stopRing();
              onDecline();
            }}
            aria-label="Decline call"
            className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-decline shadow-[0_8px_24px_rgba(255,75,75,0.35)] transition active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 rotate-[135deg]" aria-hidden>
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
            </svg>
          </button>
          <span className="text-xs text-paper/55">Decline</span>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={() => {
              stopRing();
              onAccept();
            }}
            aria-label="Accept call"
            className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full bg-accept text-accept shadow-[0_8px_24px_rgba(47,214,114,0.4)] transition active:scale-95 ring-pulse"
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8" aria-hidden>
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
            </svg>
          </button>
          <span className="text-xs text-paper/55">Accept</span>
        </div>
      </div>
    </div>
  );
}
