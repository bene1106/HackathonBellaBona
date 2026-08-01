"use client";

import { useEffect, useRef, useState } from "react";
import { Job } from "../lib/types";
import { RECRUITER_NAME, InterviewOptions } from "../lib/prompts";

type SessionHandle = {
  stop: () => Promise<void>;
  stopListening: () => string;
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoCallScreen({
  job,
  difficulty,
  options,
  onEnded,
}: {
  job: Job;
  difficulty: number;
  options: InterviewOptions;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selfViewRef = useRef<HTMLVideoElement | null>(null);
  const sessionRef = useRef<SessionHandle | null>(null);
  const endedRef = useRef(false);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [speaking, setSpeaking] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [seconds, setSeconds] = useState(0);
  // Noisy-room safety net: server-side turn detection can miss silence, so
  // after 8s of "listening" with no new user transcript we offer a manual
  // end-of-turn tap (session.stopListening()).
  const [showDoneTap, setShowDoneTap] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const speakingRef = useRef(false);
  const [pipOffset, setPipOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // Local self-view preview only; the stream is never sent anywhere.
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480 },
          audio: false,
        });
        if (selfViewRef.current) selfViewRef.current.srcObject = stream;
      } catch {
        // no camera permission: just skip the self-view
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (status !== "live") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "live") return;
    const id = setInterval(() => {
      setShowDoneTap(
        !speakingRef.current && Date.now() - lastActivityRef.current > 8000
      );
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  const forceTurn = () => {
    try {
      sessionRef.current?.stopListening();
    } catch {}
    lastActivityRef.current = Date.now();
    setShowDoneTap(false);
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEnded();
  };

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/liveavatar/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job, difficulty, options }),
        });
        if (!res.ok) throw new Error();
        const { sessionToken, isSandbox: sandbox } = await res.json();
        setIsSandbox(sandbox);

        const { LiveAvatarSession, SessionEvent, AgentEventsEnum } = await import(
          "@heygen/liveavatar-web-sdk"
        );
        const session = new LiveAvatarSession(sessionToken, { voiceChat: true });
        sessionRef.current = session;

        session.on(SessionEvent.SESSION_STATE_CHANGED, (s: string) => {
          console.log("[callmejob] liveavatar state:", s);
        });
        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          console.log("[callmejob] liveavatar stream ready");
          if (videoRef.current) session.attach(videoRef.current);
          setStatus("live");
        });
        session.on(SessionEvent.SESSION_DISCONNECTED, (reason: string) => {
          console.log("[callmejob] liveavatar disconnected:", reason);
          finish();
        });
        session.on(AgentEventsEnum.SESSION_STOPPED, () => finish());
        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          setSpeaking(true);
          speakingRef.current = true;
          lastActivityRef.current = Date.now();
        });
        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          setSpeaking(false);
          speakingRef.current = false;
          lastActivityRef.current = Date.now();
        });
        session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (e: { text: string }) => {
          console.log("[callmejob] avatar said:", e.text);
        });
        session.on(AgentEventsEnum.USER_TRANSCRIPTION, (e: { text: string }) => {
          console.log("[callmejob] user said:", e.text);
          lastActivityRef.current = Date.now();
        });

        await session.start();
        console.log("[callmejob] liveavatar start() resolved, state:", session.state);
      } catch (e) {
        console.error("[callmejob] liveavatar start failed:", e);
        setStatus("error");
      }
    })();
    // No cleanup that aborts the async start: React StrictMode double-invokes
    // effects, and cancelling on the first cleanup strands the session setup.
    // The session is closed via endCall or the SDK's own disconnect events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endCall = async () => {
    try {
      await sessionRef.current?.stop();
    } catch {}
    finish();
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />

      {status !== "live" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-ink px-8 text-center">
          {status === "connecting" ? (
            <>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full text-accept ring-pulse" />
              <p className="font-display text-xl text-paper/90">
                Setting up your video interview…
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl">Couldn&apos;t start the video round.</p>
              <p className="text-sm text-paper/60">
                Check the LiveAvatar key on the server, then try again from the score screen.
              </p>
              <button
                onClick={finish}
                className="w-full rounded-2xl border border-paper/20 py-3.5 font-display text-base text-paper/80"
              >
                Back to your score
              </button>
            </>
          )}
        </div>
      )}

      {/* FaceTime-style self view: local preview only */}
      <video
        ref={selfViewRef}
        autoPlay
        playsInline
        muted
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            baseX: pipOffset.x,
            baseY: pipOffset.y,
          };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          setPipOffset({
            x: dragRef.current.baseX + e.clientX - dragRef.current.startX,
            y: dragRef.current.baseY + e.clientY - dragRef.current.startY,
          });
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        style={{ transform: `translate(${pipOffset.x}px, ${pipOffset.y}px) scaleX(-1)` }}
        className="absolute right-4 top-24 z-30 h-[140px] w-[100px] cursor-grab touch-none rounded-2xl border border-paper/20 bg-ink/60 object-cover shadow-lg active:cursor-grabbing"
      />

      <div className="relative z-20 flex items-start justify-between p-5 pt-8">
        <div className="rounded-xl bg-ink/70 px-3 py-2 backdrop-blur">
          <p className="font-display text-sm font-semibold">{RECRUITER_NAME}</p>
          <p className="text-xs text-paper/60">
            {job.company} · video round {difficulty}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {status === "live" && (
            <span className="rounded-lg bg-ink/70 px-2.5 py-1 font-mono text-sm tabular-nums backdrop-blur">
              {formatTime(seconds)}
            </span>
          )}
          {isSandbox && (
            <span className="rounded-lg bg-decline/20 px-2.5 py-1 text-xs text-decline backdrop-blur">
              Sandbox · 1 min limit
            </span>
          )}
        </div>
      </div>

      <div className="relative z-20 mt-auto flex flex-col items-center gap-3 pb-12">
        {status === "live" && showDoneTap && !speaking && (
          <button
            onClick={forceTurn}
            className="rounded-full border border-paper/25 bg-ink/70 px-4 py-2 text-sm text-paper/90 backdrop-blur transition active:scale-95"
          >
            Tap when you&apos;re done
          </button>
        )}
        {status === "live" && (
          <p className="rounded-lg bg-ink/70 px-3 py-1.5 text-xs text-paper/80 backdrop-blur" aria-live="polite">
            {speaking ? "Recruiter is speaking…" : "Listening to you…"}
          </p>
        )}
        <button
          onClick={endCall}
          aria-label="End video call"
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-decline shadow-lg transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 rotate-[135deg]" aria-hidden>
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
