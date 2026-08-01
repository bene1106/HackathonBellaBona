"use client";

import { useRef, useState } from "react";
import { DifficultyLevel, DurationMinutes } from "../lib/prompts";
import { Mode } from "../lib/types";

const EXAMPLE_JOB =
  "Growth Marketing Manager at Bella&Bona in Munich. We are a food-tech startup delivering healthy office lunches. Looking for B2C growth experience, performance marketing skills, strong analytics, creativity, and German market knowledge.";

const EXAMPLE_PITCH =
  "Lunchloop delivers healthy office lunch subscriptions to small companies in Munich. 40 companies subscribed, 2,100 meals a week, growing 22% month over month. Team of 3, two ex Delivery Hero. Raising a 750k pre-seed to expand to Berlin.";

type LevelOption = { value: DifficultyLevel; label: string; hint: string };

const LEVELS: LevelOption[] = [
  { value: "easy", label: "Easy", hint: "Friendly recruiter, softball questions" },
  { value: "medium", label: "Medium", hint: "Professional, asks follow-ups" },
  { value: "hard", label: "Hard", hint: "Skeptical, interrupts, challenges weak answers" },
];

const PITCH_LEVELS: LevelOption[] = [
  { value: "easy", label: "Easy", hint: "Friendly angel, softball questions" },
  { value: "medium", label: "Medium", hint: "Seed partner, asks follow-ups" },
  { value: "hard", label: "Hard", hint: "Skeptical Series A partner, challenges your numbers" },
];

const COPY: Record<
  Mode,
  {
    headline: [string, string];
    sub: string;
    fieldLabel: string;
    placeholder: string;
    example: string;
    exampleChip: string;
    cvLabel: string;
    cvPlaceholder: string;
    cvChipNote: string;
    surpriseHint: string;
    submit: string;
    levels: LevelOption[];
  }
> = {
  job: {
    headline: ["Set up", "your interview."],
    sub: "Your recruiter preps from the real posting and your CV.",
    fieldLabel: "The job",
    placeholder: "Paste job posting link or text",
    example: EXAMPLE_JOB,
    exampleChip: "Try an example job",
    cvLabel: "Your CV, optional",
    cvPlaceholder: "Paste your CV. The recruiter will probe what you claim",
    cvChipNote: "CV attached",
    surpriseHint: "One curveball you cannot rehearse",
    submit: "Build my interview plan",
    levels: LEVELS,
  },
  pitch: {
    headline: ["Set up", "your pitch call."],
    sub: "Your investor preps from your deck and your script.",
    fieldLabel: "Your startup",
    placeholder: "Paste your pitch deck text or describe your startup",
    example: EXAMPLE_PITCH,
    exampleChip: "Try an example startup",
    cvLabel: "Your pitch script, optional",
    cvPlaceholder: "Paste your pitch script. The VC will probe what you claim",
    cvChipNote: "Script attached",
    surpriseHint: "One curveball: what kills this company?",
    submit: "Build my pitch plan",
    levels: PITCH_LEVELS,
  },
};

const DURATIONS: { value: DurationMinutes; num: string; unit: string }[] = [
  { value: 1, num: "1", unit: "min" },
  { value: 5, num: "5", unit: "min" },
  { value: 10, num: "10", unit: "min" },
  { value: 30, num: "30", unit: "min" },
  { value: 60, num: "1", unit: "hour" },
];

export type SetupValues = {
  mode: Mode;
  input: string;
  cv: string;
  cvFileName: string | null;
  cvFileSize: number | null;
  surprise: boolean;
  level: DifficultyLevel;
  duration: DurationMinutes;
};

export const DEFAULT_SETUP: SetupValues = {
  mode: "job",
  input: "",
  cv: "",
  cvFileName: null,
  cvFileSize: null,
  surprise: true,
  level: "medium",
  duration: 5,
};

async function extractPdfText(file: File): Promise<string> {
  // pdfjs v5 ESM breaks under this webpack config, so we self-host the files
  // in /public and load them with a native browser import instead.
  const pdfjs = await import(/* webpackIgnore: true */ "/pdfjs/pdf.min.mjs" as string);
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item: { str?: string }) => item.str ?? "")
        .join(" ")
    );
  }
  return pages.join("\n").replace(/\s+/g, " ").trim();
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute/80">
      {children}
    </p>
  );
}

export default function HomeScreen({
  initial = DEFAULT_SETUP,
  onSubmit,
  onBack,
}: {
  initial?: SetupValues;
  onSubmit: (values: SetupValues) => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [input, setInput] = useState(initial.input);
  const [cv, setCv] = useState(initial.cv);
  const [showCv, setShowCv] = useState(Boolean(initial.cv));
  const [surprise, setSurprise] = useState(initial.surprise);
  const [level, setLevel] = useState<DifficultyLevel>(initial.level);
  const [duration, setDuration] = useState<DurationMinutes>(initial.duration);
  const [cvFileName, setCvFileName] = useState<string | null>(initial.cvFileName);
  const [cvFileSize, setCvFileSize] = useState<number | null>(initial.cvFileSize);
  const [cvBusy, setCvBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePdf = async (file: File | undefined) => {
    if (!file) return;
    setCvBusy(true);
    try {
      const text = await extractPdfText(file);
      if (text) {
        setCv(text);
        setCvFileName(file.name);
        setCvFileSize(file.size);
      }
    } catch (e) {
      console.error("[coldcall] pdf extraction failed:", e);
      setCvFileName(null);
      setCvFileSize(null);
    }
    setCvBusy(false);
  };

  const removePdf = () => {
    setCv("");
    setCvFileName(null);
    setCvFileSize(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const copy = COPY[mode];

  return (
    <div className="screen-in flex flex-1 flex-col px-6 pb-8 pt-12">
      <div className="lift grid grid-cols-2 gap-1 rounded-full border border-line bg-card p-1">
        {(
          [
            { value: "job", label: "Job interview" },
            { value: "pitch", label: "Startup pitch" },
          ] as { value: Mode; label: string }[]
        ).map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            aria-pressed={mode === m.value}
            className={`rounded-full py-2.5 text-sm transition ${
              mode === m.value
                ? "bg-ink font-semibold text-bone"
                : "text-mute"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h1 className="font-display text-4xl font-bold leading-[1.08]">
          {copy.headline[0]}
          <br />
          {copy.headline[1]}
        </h1>
        <p className="mt-2 text-sm text-mute">{copy.sub}</p>
      </div>

      <div className="mt-8 flex-1 space-y-6">
        <div className="space-y-2">
          <FieldLabel>{copy.fieldLabel}</FieldLabel>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.placeholder}
              rows={4}
              className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-base text-ink placeholder:text-mute/60 focus:border-accept/60 focus:outline-none"
            />
            {!input && (
              <button
                onClick={() => setInput(copy.example)}
                className="absolute bottom-3.5 left-3 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-mute transition active:scale-95"
              >
                {copy.exampleChip}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>{copy.cvLabel}</FieldLabel>
          {cvFileName ? (
            <div className="flex items-center gap-3 rounded-2xl border border-accept/30 bg-accept/[0.07] px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accept/15 text-deep">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{cvFileName}</p>
                <p className="font-mono text-[11px] text-mute/80">
                  {cvFileSize ? `${formatSize(cvFileSize)} · ` : ""}{copy.cvChipNote}
                </p>
              </div>
              <button
                onClick={removePdf}
                className="shrink-0 text-sm font-medium text-[#C23636]"
              >
                Remove
              </button>
            </div>
          ) : showCv ? (
            <div className="space-y-2">
              <textarea
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                placeholder={copy.cvPlaceholder}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-sm text-ink placeholder:text-mute/60 focus:border-accept/60 focus:outline-none"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={cvBusy}
                className="text-sm text-mute underline decoration-mute/40 underline-offset-4 disabled:opacity-50"
              >
                {cvBusy ? "Reading PDF…" : "or upload a PDF"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={cvBusy}
                className="rounded-full border border-line px-4 py-2 text-sm text-mute transition active:scale-95 disabled:opacity-50"
              >
                {cvBusy ? "Reading PDF…" : "Upload PDF"}
              </button>
              <button
                onClick={() => setShowCv(true)}
                className="text-sm text-mute underline decoration-mute/40 underline-offset-4"
              >
                or paste text
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handlePdf(e.target.files?.[0])}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Length</FieldLabel>
          <div className="grid grid-cols-5 gap-1 rounded-2xl border border-line p-1">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                aria-pressed={duration === d.value}
                className={`flex flex-col items-center rounded-xl py-2 transition ${
                  duration === d.value
                    ? "bg-ink text-bone"
                    : "text-mute/80"
                }`}
              >
                <span className="font-display text-base font-semibold leading-none">
                  {d.num}
                </span>
                <span className="mt-1 font-mono text-[10px] leading-none">
                  {d.unit}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Difficulty</FieldLabel>
          <div className="space-y-1.5">
            {copy.levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                aria-pressed={level === l.value}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  level === l.value
                    ? "border-accept/50 bg-accept/[0.06]"
                    : "border-line"
                }`}
              >
                <span>
                  <span
                    className={`block text-sm font-semibold ${
                      level === l.value ? "text-ink" : "text-mute"
                    }`}
                  >
                    {l.label}
                  </span>
                  <span className="block text-xs text-mute/80">{l.hint}</span>
                </span>
                {level === l.value && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#147A46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSurprise((s) => !s)}
          role="switch"
          aria-checked={surprise}
          className="flex w-full items-center justify-between rounded-2xl border border-line px-4 py-3"
        >
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink/80">
              Surprise questions
            </span>
            <span className="block text-xs text-mute/80">
              {copy.surpriseHint}
            </span>
          </span>
          <span
            className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors ${
              surprise ? "bg-accept" : "bg-ink/15"
            }`}
          >
            <span
              className={`absolute left-0 top-0.5 inline-block h-5 w-5 rounded-full bg-card transition-transform ${
                surprise ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={() =>
            onSubmit({
              mode,
              input: input.trim(),
              cv: cv.trim(),
              cvFileName,
              cvFileSize,
              surprise,
              level,
              duration,
            })
          }
          disabled={!input.trim() || cvBusy}
          className="w-full rounded-full bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          {copy.submit}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full text-center text-sm text-mute"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
