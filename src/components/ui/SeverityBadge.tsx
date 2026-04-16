import { getSeverityColor } from "@/lib/utils";
import type { Severity } from "@/lib/schemas/report";

interface SeverityBadgeProps {
  severity: Severity;
}

const LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${getSeverityColor(severity)}`}
    >
      {LABELS[severity]}
    </span>
  );
}
