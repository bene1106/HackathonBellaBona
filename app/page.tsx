"use client";

import { useCallback, useState } from "react";
import { Screen, Job, TranscriptEntry, Feedback, InterviewPlan } from "../lib/types";
import { FALLBACK_JOB } from "../lib/fallbackJob";
import { InterviewOptions } from "../lib/prompts";
import { buildFallbackPlan, isValidPlan } from "../lib/plan";
import LandingScreen from "../components/LandingScreen";
import HomeScreen, { SetupValues, DEFAULT_SETUP } from "../components/HomeScreen";
import ResearchScreen from "../components/ResearchScreen";
import PlanScreen from "../components/PlanScreen";
import IncomingCallScreen from "../components/IncomingCallScreen";
import LiveCallScreen from "../components/LiveCallScreen";
import FeedbackScreen from "../components/FeedbackScreen";
import VideoCallScreen from "../components/VideoCallScreen";
import MentorScreen from "../components/MentorScreen";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [setup, setSetup] = useState<SetupValues>(DEFAULT_SETUP);
  const [job, setJob] = useState<Job>(FALLBACK_JOB);
  const [plan, setPlan] = useState<InterviewPlan | null>(null);
  const [options, setOptions] = useState<InterviewOptions>({});
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [researchStep, setResearchStep] = useState(0);
  const [researchCompany, setResearchCompany] = useState<string | null>(null);
  const [redoQuestion, setRedoQuestion] = useState<string | null>(null);

  const startResearch = useCallback(async (values: SetupValues) => {
    setSetup(values);
    setScreen("prep");
    setResearchStep(0);
    setResearchCompany(null);
    setDifficulty(1);
    setRedoQuestion(null);
    setFeedback(null);
    const baseOptions: InterviewOptions = {
      cv: values.cv || undefined,
      surprise: values.surprise,
      level: values.level,
      duration: values.duration,
    };
    setOptions(baseOptions);

    let parsedJob: Job = FALLBACK_JOB;
    const minRead = wait(1800);
    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: values.input }),
      });
      parsedJob = (await res.json()) as Job;
      sessionStorage.setItem("coldcall.job", JSON.stringify(parsedJob));
    } catch {
      parsedJob = FALLBACK_JOB;
    }
    setJob(parsedJob);
    await minRead;

    setResearchCompany(parsedJob.company);
    setResearchStep(1);
    await wait(1400);

    setResearchStep(2);
    const minPlan = wait(1800);
    let newPlan = buildFallbackPlan(parsedJob, values.duration, values.surprise);
    try {
      const res = await fetch("/api/interview-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: parsedJob,
          duration: values.duration,
          level: values.level,
          surprise: values.surprise,
          cv: values.cv || undefined,
        }),
      });
      const data = await res.json();
      if (isValidPlan(data)) newPlan = data;
    } catch {}
    await minPlan;

    setPlan(newPlan);
    setOptions({ ...baseOptions, plan: newPlan });
    setResearchStep(3);
    setScreen("plan");
  }, []);

  const handleCallEnded = useCallback((entries: TranscriptEntry[]) => {
    setTranscript(entries);
    setScreen("feedback");
  }, []);

  const callAgain = useCallback(() => {
    setDifficulty((d) => d + 1);
    setRedoQuestion(null);
    setFeedback(null);
    setScreen("incoming");
  }, []);

  const redoOneQuestion = useCallback((question: string) => {
    setRedoQuestion(question);
    setFeedback(null);
    setScreen("incoming");
  }, []);

  const newJob = useCallback(() => {
    setFeedback(null);
    setTranscript([]);
    setDifficulty(1);
    setOptions({});
    setPlan(null);
    setRedoQuestion(null);
    setScreen("home");
  }, []);

  const liveOptions: InterviewOptions = redoQuestion
    ? { ...options, plan: undefined, duration: 1, redoQuestion }
    : options;

  return (
    <main className="phone-frame">
      {screen === "landing" && <LandingScreen onStart={() => setScreen("home")} />}
      {screen === "home" && (
        <HomeScreen
          initial={setup}
          onSubmit={startResearch}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "prep" && (
        <ResearchScreen step={researchStep} company={researchCompany} />
      )}
      {screen === "plan" && plan && (
        <PlanScreen
          job={job}
          plan={plan}
          level={setup.level}
          duration={setup.duration}
          onStart={() => setScreen("incoming")}
          onAdjust={() => setScreen("home")}
        />
      )}
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
          options={liveOptions}
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
          onMentor={() => setScreen("mentor")}
        />
      )}
      {screen === "mentor" && <MentorScreen onBack={() => setScreen("feedback")} />}
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
