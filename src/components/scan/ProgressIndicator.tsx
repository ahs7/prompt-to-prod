"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Stage {
  label: string;
  durationMs: number;
}

const STAGES: Stage[] = [
  { label: "Validating URL...", durationMs: 1500 },
  { label: "Fetching pages...", durationMs: 4000 },
  { label: "Analyzing content...", durationMs: 5000 },
  { label: "Running performance checks...", durationMs: 4000 },
  { label: "Generating your report...", durationMs: 8000 },
];

interface ProgressIndicatorProps {
  scanId: string;
  url: string;
}

export function ProgressIndicator({ scanId, url }: ProgressIndicatorProps) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [statusMessage, setStatusMessage] = useState(STAGES[0].label);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Advance through visual stages
  useEffect(() => {
    let stage = 0;
    const advance = () => {
      if (stage < STAGES.length - 1) {
        stage++;
        setCurrentStage(stage);
        setStatusMessage(STAGES[stage].label);
      }
    };

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 0; i < STAGES.length; i++) {
      elapsed += STAGES[i].durationMs;
      timers.push(setTimeout(advance, elapsed));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Poll scan status
  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 60 × 3s = 3 minutes

    const poll = async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        setError("Scan is taking longer than expected. Please try again.");
        return;
      }

      try {
        const response = await fetch(`/api/scan/${scanId}`);
        const data = await response.json();

        if (data.status === "complete" && data.reportId) {
          router.push(`/report/${data.reportId}`);
          return;
        }

        if (data.status === "failed") {
          setError(
            data.error ?? "The scan failed. Please check the URL and try again."
          );
          return;
        }

        // Still scanning — poll again
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };

    const timer = setTimeout(poll, 3000);
    return () => clearTimeout(timer);
  }, [scanId, router]);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="text-rose-400 text-5xl">⚠</div>
        <p className="text-slate-300 text-base">{error}</p>
        <a
          href="/"
          className="inline-block mt-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Try again
        </a>
      </div>
    );
  }

  const totalStages = STAGES.length;
  const progress = Math.round(((currentStage + 1) / totalStages) * 100);

  return (
    <div className="space-y-8 text-center max-w-md mx-auto">
      {/* Animated scanner orb */}
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-indigo-500/30 animate-ping animation-delay-150" />
        <div className="relative w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-indigo-400 animate-spin-slow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
      </div>

      {/* URL being scanned */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Scanning
        </p>
        <p className="text-sm text-slate-300 font-mono truncate max-w-xs mx-auto">
          {url}
        </p>
      </div>

      {/* Current stage message */}
      <div className="h-8 flex items-center justify-center">
        <p className="text-base font-medium text-slate-200 animate-fade-in">
          {statusMessage}
          <span className="text-indigo-400">{dots}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          {STAGES.map((stage, i) => (
            <span
              key={i}
              className={i <= currentStage ? "text-indigo-400" : ""}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600">
        This usually takes 30–60 seconds.
      </p>
    </div>
  );
}
