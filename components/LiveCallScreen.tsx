"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Job, TranscriptEntry } from "../lib/types";
import {
  buildRecruiterPrompt,
  buildFirstMessage,
  RECRUITER_NAME,
  InterviewOptions,
} from "../lib/prompts";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function LiveCallScreen(props: {
  job: Job;
  difficulty: number;
  options: InterviewOptions;
  onEnded: (transcript: TranscriptEntry[]) => void;
}) {
  return (
    <ConversationProvider>
      <LiveCall {...props} />
    </ConversationProvider>
  );
}

function LiveCall({
  job,
  difficulty,
  options,
  onEnded,
}: {
  job: Job;
  difficulty: number;
  options: InterviewOptions;
  onEnded: (transcript: TranscriptEntry[]) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const endedRef = useRef(false);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEnded(transcriptRef.current);
  }, [onEnded]);

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: string }) => {
      transcriptRef.current = [
        ...transcriptRef.current,
        { speaker: source === "ai" ? "recruiter" : "candidate", text: message },
      ];
    },
    onDisconnect: () => finish(),
    onError: (message: string) => setError(String(message)),
  });

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "",
          connectionType: "websocket",
          overrides: {
            agent: {
              prompt: { prompt: buildRecruiterPrompt(job, difficulty, options) },
              firstMessage: buildFirstMessage(job, options),
            },
          },
        });
      } catch (e) {
        setError(
          "Could not start the call. Check mic permission and that the page is served over https (or localhost)."
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const endCall = async () => {
    try {
      await conversation.endSession();
    } catch {}
    finish();
  };

  const speaking = conversation.isSpeaking;
  const connected = conversation.status === "connected";

  return (
    <div className="screen-in flex flex-1 flex-col items-center justify-between pb-14 pt-16">
      <div className="flex flex-col items-center">
        <h1 className="px-6 text-center font-display text-3xl font-semibold">
          {RECRUITER_NAME}
        </h1>
        <p className="mt-1 text-sm text-paper/50">
          {job.company} Recruiting
        </p>
        <p className="mt-5 font-mono text-4xl font-light tabular-nums text-paper">
          {connected ? formatTime(seconds) : "0:00"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-7">
        <div
          className={`flex h-36 w-36 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
            speaking
              ? "speaking border-accept bg-accept/15 text-accept"
              : "border-paper/20 bg-paper/5 text-paper/60"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14" aria-hidden>
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-8 2.6-8 5.5V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-2.9-3-5.5-8-5.5Z" />
          </svg>
        </div>
        <p className="flex items-center gap-2 text-sm text-paper/60" aria-live="polite">
          {!error && connected && (
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                speaking ? "bg-accept" : "animate-pulse bg-paper/60"
              }`}
            />
          )}
          {error
            ? error
            : !connected
              ? "Connecting to your recruiter…"
              : speaking
                ? "Recruiter is speaking…"
                : "Listening to you…"}
        </p>
      </div>

      <button
        onClick={endCall}
        aria-label="End call"
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-decline shadow-lg transition active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 rotate-[135deg]" aria-hidden>
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
        </svg>
      </button>
    </div>
  );
}
