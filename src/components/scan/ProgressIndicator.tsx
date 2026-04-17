"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 3; // fetch, analyze, complete

interface ProgressIndicatorProps {
  scanId: string;
  url: string;
}

type Phase = "fetch" | "analyze" | "done" | "error";

export function ProgressIndicator({ scanId, url }: ProgressIndicatorProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("fetch");
  const [message, setMessage] = useState("Fetching pages...");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Animated dots
  useEffect(() => {
    const id = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      400
    );
    return () => clearInterval(id);
  }, []);

  // Polling fallback — used if the analyze stream drops before completing
  function startPolling() {
    let attempts = 0;
    const poll = async () => {
      if (attempts++ > 80) {
        setError("Scan is taking longer than expected. Please try again.");
        return;
      }
      try {
        const res = await fetch(`/api/scan/${scanId}`);
        const data = (await res.json()) as {
          status: string;
          reportId?: string;
          error?: string;
        };
        if (data.status === "complete" && data.reportId) {
          router.push(`/report/${data.reportId}`);
          return;
        }
        if (data.status === "failed") {
          setError(data.error ?? "Scan failed. Please check the URL and try again.");
          return;
        }
        setTimeout(poll, 3_000);
      } catch {
        setTimeout(poll, 5_000);
      }
    };
    setTimeout(poll, 3_000);
  }

  useEffect(() => {
    const abort = new AbortController();
    abortRef.current = abort;

    async function run() {
      // ── Stage 1: fetch + crawl (Node.js, <10 s) ──────────────────────────
      try {
        const res = await fetch(`/api/scan/${scanId}/fetch`, {
          method: "POST",
          signal: abort.signal,
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };

        if (!res.ok || !data.ok) {
          setError(data.error ?? "Failed to fetch the page. Please try again.");
          setPhase("error");
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Network error during fetch. Please try again.");
        setPhase("error");
        return;
      }

      if (abort.signal.aborted) return;

      // ── Stage 2: AI analysis (Edge, streaming) ────────────────────────────
      setPhase("analyze");
      setStep(2);
      setMessage("Analyzing content...");

      // Brief pause so the UI updates before the next request
      await new Promise((r) => setTimeout(r, 300));
      setMessage("Generating your report...");
      setStep(3);

      try {
        const res = await fetch(`/api/scan/${scanId}/analyze`, {
          method: "POST",
          signal: abort.signal,
        });

        if (!res.ok || !res.body) {
          // Might already be complete — fall back to polling
          startPolling();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by \n\n
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? ""; // keep the incomplete tail

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            let evt: Record<string, unknown>;
            try {
              evt = JSON.parse(line.slice(5).trim()) as Record<string, unknown>;
            } catch {
              continue;
            }

            if (evt.event === "heartbeat") continue;

            if (evt.event === "progress" && typeof evt.message === "string") {
              setMessage(evt.message);
            }

            if (evt.event === "complete" && typeof evt.reportId === "string") {
              setPhase("done");
              router.push(`/report/${evt.reportId}`);
              return;
            }

            if (evt.event === "error" && typeof evt.message === "string") {
              setError(evt.message);
              setPhase("error");
              return;
            }
          }
        }

        // Stream ended without a complete event — fall back to polling
        startPolling();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Stream dropped — poll for result
        startPolling();
      }
    }

    run();
    return () => abort.abort();
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

  const progress = Math.max(5, Math.round((step / TOTAL_STEPS) * 100));

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
          {message}
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
          {["Fetch", "Analyze", "Report"].map((label, i) => (
            <span
              key={label}
              className={i + 1 <= step ? "text-indigo-400" : "text-slate-700"}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600">
        {phase === "analyze"
          ? "AI analysis in progress — this takes 20–60 seconds."
          : "Fetching your pages — usually done in a few seconds."}
      </p>
    </div>
  );
}
