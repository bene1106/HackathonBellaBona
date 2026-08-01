"use client";

import { useRef, useState } from "react";
import { DifficultyLevel } from "../lib/prompts";

const EXAMPLE_JOB =
  "Growth Marketing Manager at Bella&Bona in Munich. We are a food-tech startup delivering healthy office lunches. Looking for B2C growth experience, performance marketing skills, strong analytics, creativity, and German market knowledge.";

const LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

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

export default function HomeScreen({
  onSubmit,
}: {
  onSubmit: (
    input: string,
    cv: string,
    surprise: boolean,
    level: DifficultyLevel
  ) => void;
}) {
  const [input, setInput] = useState("");
  const [cv, setCv] = useState("");
  const [showCv, setShowCv] = useState(false);
  const [surprise, setSurprise] = useState(true);
  const [level, setLevel] = useState<DifficultyLevel>("medium");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
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
      }
    } catch (e) {
      console.error("[coldcall] pdf extraction failed:", e);
      setCvFileName(null);
    }
    setCvBusy(false);
  };

  const removePdf = () => {
    setCv("");
    setCvFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="screen-in flex flex-1 flex-col justify-between px-6 pb-8 pt-16">
      <h1 className="font-display text-5xl font-bold leading-[1.05]">
        Your phone is about to ring.
      </h1>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste job posting link or text"
            rows={4}
            className="w-full resize-none rounded-2xl border border-paper/15 bg-paper/5 p-4 text-base text-paper placeholder:text-paper/40 focus:border-accept/60 focus:outline-none"
          />
          {!input && (
            <button
              onClick={() => setInput(EXAMPLE_JOB)}
              className="absolute bottom-3.5 left-3 rounded-full border border-paper/15 bg-ink px-3 py-1.5 text-xs text-paper/60 transition active:scale-95"
            >
              Try an example job
            </button>
          )}
        </div>

        {showCv ? (
          <div className="space-y-2">
            {cvFileName ? (
              <div className="flex items-center justify-between rounded-2xl border border-paper/15 bg-paper/5 px-4 py-3">
                <span className="truncate text-sm text-paper/80">{cvFileName}</span>
                <button
                  onClick={removePdf}
                  className="ml-3 shrink-0 text-sm text-decline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                  placeholder="Paste your CV (optional). The recruiter will probe what you claim"
                  rows={3}
                  autoFocus
                  className="w-full resize-none rounded-2xl border border-paper/15 bg-paper/5 p-4 text-sm text-paper placeholder:text-paper/40 focus:border-accept/60 focus:outline-none"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={cvBusy}
                  className="text-sm text-paper/50 underline decoration-paper/30 underline-offset-4 disabled:opacity-50"
                >
                  {cvBusy ? "Reading PDF…" : "or upload a PDF"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handlePdf(e.target.files?.[0])}
                />
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowCv(true)}
            className="text-sm text-paper/50 underline decoration-paper/30 underline-offset-4"
          >
            + Add your CV (optional)
          </button>
        )}

        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-paper/10 p-1">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              aria-pressed={level === l.value}
              className={`rounded-xl py-2.5 text-sm transition ${
                level === l.value
                  ? "bg-paper/15 font-semibold text-paper"
                  : "text-paper/50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSurprise((s) => !s)}
          role="switch"
          aria-checked={surprise}
          className="flex w-full items-center justify-between rounded-2xl border border-paper/10 px-4 py-3"
        >
          <span className="text-sm text-paper/70">Surprise questions</span>
          <span
            className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors ${
              surprise ? "bg-accept" : "bg-paper/20"
            }`}
          >
            <span
              className={`absolute left-0 top-0.5 inline-block h-5 w-5 rounded-full bg-paper transition-transform ${
                surprise ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <button
          onClick={() => onSubmit(input.trim(), cv.trim(), surprise, level)}
          disabled={!input.trim()}
          className="w-full rounded-2xl bg-accept py-4 font-display text-lg font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          Get the call
        </button>
      </div>
    </div>
  );
}
