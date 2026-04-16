"use client";

import { getScoreLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
}

function getStrokeColor(score: number): string {
  if (score >= 70) return "#10B981"; // emerald
  if (score >= 40) return "#F59E0B"; // amber
  return "#F43F5E"; // rose
}

export function ScoreRing({ score, label, size = 120 }: ScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const strokeColor = getStrokeColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={8}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease-in-out" }}
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: strokeColor }}
          >
            {score}
          </span>
          <span className="text-xs text-slate-400">{scoreLabel}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-300 text-center leading-tight max-w-[110px]">
        {label}
      </span>
    </div>
  );
}
