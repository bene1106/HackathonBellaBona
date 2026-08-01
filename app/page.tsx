"use client";

import { useCallback, useState } from "react";
import { Screen, Job, TranscriptEntry, Feedback } from "../lib/types";
import { FALLBACK_JOB } from "../lib/fallbackJob";
import { InterviewOptions, DifficultyLevel } from "../lib/prompts";
import HomeScreen from "../components/HomeScreen";
import PrepScreen from "../components/PrepScreen";
import IncomingCallScreen from "../components/IncomingCallScreen";
import LiveCallScreen from "../components/LiveCallScreen";
import FeedbackScreen from "../components/FeedbackScreen";
import VideoCallScreen from "../components/VideoCallScreen";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [job, setJob] = useState<Job>(FALLBACK_JOB);
  const [options, setOptions] = useState<InterviewOptions>({});
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [difficulty, setDifficulty] = useState(1);

  const startPrep = useCallback(
    async (input: string, cv: string, surprise: boolean, level: DifficultyLevel) => {
    setScreen("prep");
    setDifficulty(1);
    setOptions({ cv: cv || undefined, surprise, level });
    const minPrep = new Promise((r) => setTimeout(r, 3500));
    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = (await res.json()) as Job;
      setJob(data);
      sessionStorage.setItem("coldcall.job", JSON.stringify(data));
    } catch {
      setJob(FALLBACK_JOB);
    }
    await minPrep;
    setScreen("incoming");
    },
    []
  );

  const handleCallEnded = useCallback((entries: TranscriptEntry[]) => {
    setTranscript(entries);
    setScreen("feedback");
  }, []);

  const callAgain = useCallback(() => {
    setDifficulty((d) => d + 1);
    setFeedback(null);
    setScreen("incoming");
  }, []);

  const newJob = useCallback(() => {
    setFeedback(null);
    setTranscript([]);
    setDifficulty(1);
    setOptions({});
    setScreen("home");
  }, []);

  return (
    <main className="phone-frame">
      {screen === "home" && <HomeScreen onSubmit={startPrep} />}
      {screen === "prep" && <PrepScreen />}
      {screen === "incoming" && (
        <IncomingCallScreen
          job={job}
          onAccept={() => setScreen("live")}
          onDecline={newJob}
        />
      )}
      {screen === "live" && (
        <LiveCallScreen
          job={job}
          difficulty={difficulty}
          options={options}
          onEnded={handleCallEnded}
        />
      )}
      {screen === "feedback" && (
        <FeedbackScreen
          job={job}
          transcript={transcript}
          cv={options.cv}
          feedback={feedback}
          setFeedback={setFeedback}
          onCallAgain={callAgain}
          onVideoRound={() => setScreen("video")}
          onNewJob={newJob}
        />
      )}
      {screen === "video" && (
        <VideoCallScreen
          job={job}
          difficulty={difficulty}
          options={options}
          onEnded={() => setScreen("feedback")}
        />
      )}
    </main>
  );
}
