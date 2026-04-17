"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STAGE_LABELS: Record<string, string> = {
  validating: "Validating URL...",
  fetching: "Fetching pages...",
  crawling: "Analyzing content...",
  performance: "Running performance checks...",
  generating: "Generating your report...",
};

const TOTAL_STEPS = 5;

interface ProgressIndicatorProps {
  scanId: string;
  url: string;
}

export function ProgressIndicator({ scanId, url }: ProgressIndicatorProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");
  const sourceRef = useRef<EventSource | null>(null);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      400
    );
    return () => clearInterval(interval);
  }, []);

  // Polling fallback — used if EventSource fails or isn't supported
  const startPolling = (scanId: string) => {
    let attempts = 0;
    const MAX = 80; // 80 × 3 s = 4 min

    const poll = async () => {
      if (attempts++ > MAX) {
        setError("Scan is taking longer than expected. Please try again.");
        return;
      }
      try {
        const res = await fetch(`/api/scan/${scanId}`);
        const data = await res.json();
        if (data.status === "complete" && data.reportId) {
          router.push(`/report/${data.reportId}`);
          return;
        }
        if (data.status === "failed") {
          setError(data.error ?? "The scan failed. Please check the URL and try again.");
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };

    setTimeout(poll, 3000);
  };

  // Main effect: open SSE stream, fall back to polling on error
  useEffect(() => {
    if (typeof EventSource === "undefined") {
      // SSE not available (very rare in modern browsers)
      startPolling(scanId);
      return;
    }

    const source = new EventSource(`/api/scan/${scanId}/run`);
    sourceRef.current = source;

    source.onmessage = (e: MessageEvent<string>) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(e.data) as Record<string, unknown>;
      } catch {
        return;
      }

      if (data.event === "heartbeat") return;

      if (data.event === "progress") {
        const msg = STAGE_LABELS[data.stage as string] ?? (data.message as string);
        setStatusMessage(msg);
        setStep((data.step as number) ?? 0);
        return;
      }

      if (data.event === "complete" && typeof data.reportId === "string") {
        source.close();
        router.push(`/report/${data.reportId}`);
        return;
      }

      if (data.event === "error") {
        source.close();
        setError((data.message as string) ?? "Scan failed. Please try again.");
      }
    };

    source.onerror = () => {
      // Connection dropped (function timed out or network issue).
      // Close SSE and fall back to polling — the DB might already have the result.
      source.close();
      setStatusMessage("Finalizing your report...");
      startPolling(scanId);
    };

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

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

  const progress = step === 0 ? 5 : Math.round((step / TOTAL_STEPS) * 100);

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

      {/* URL */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Scanning
        </p>
        <p className="text-sm text-slate-300 font-mono truncate max-w-xs mx-auto">
          {url}
        </p>
      </div>

      {/* Stage message */}
      <div className="h-8 flex items-center justify-center">
        <p className="text-base font-medium text-slate-200">
          {statusMessage}
          <span className="text-indigo-400">{dots}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={i < step ? "text-indigo-400" : "text-slate-700"}
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
