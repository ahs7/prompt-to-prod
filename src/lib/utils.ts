type ClassValue = string | number | boolean | null | undefined | ClassValue[];

/**
 * Utility to merge Tailwind class names conditionally.
 */
export function cn(...inputs: ClassValue[]): string {
  function flatten(val: ClassValue): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) return val.map(flatten).filter(Boolean).join(" ");
    return "";
  }
  return inputs.map(flatten).filter(Boolean).join(" ");
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-rose-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Passing";
  if (score >= 40) return "Needs Work";
  if (score >= 20) return "Weak";
  return "Critical";
}

export function getVerdictLabel(verdict: string): string {
  switch (verdict) {
    case "ready_with_fixes":
      return "Ready with Fixes";
    case "partially_ready":
      return "Partially Ready";
    case "not_ready":
      return "Not Ready";
    default:
      return verdict;
  }
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "ready_with_fixes":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    case "partially_ready":
      return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    case "not_ready":
      return "text-rose-500 bg-rose-500/10 border-rose-500/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    case "high":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium":
      return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
    case "low":
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  }
}

export function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url;
  }
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
