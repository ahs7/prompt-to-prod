import { ScoreRing } from "@/components/ui/ScoreRing";
import { getVerdictLabel, getVerdictColor } from "@/lib/utils";
import type { Report } from "@/lib/schemas/report";

interface ScoreSectionProps {
  report: Report;
}

export function ScoreSection({ report }: ScoreSectionProps) {
  const { scores, verdict, executive_summary } = report;
  const verdictClasses = getVerdictColor(verdict);
  const verdictLabel = getVerdictLabel(verdict);

  return (
    <div className="space-y-6">
      {/* Verdict badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide ${verdictClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          {verdictLabel}
        </span>
      </div>

      {/* Executive summary */}
      <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
        {executive_summary}
      </p>

      {/* Score rings */}
      <div className="flex flex-wrap gap-8 pt-2">
        <ScoreRing
          score={scores.production_readiness}
          label="Production Readiness"
        />
        <ScoreRing
          score={scores.growth_readiness}
          label="Growth Readiness"
        />
        <ScoreRing
          score={scores.trust_conversion}
          label="Trust & Conversion"
        />
      </div>
    </div>
  );
}
