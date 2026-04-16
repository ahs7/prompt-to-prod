import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { Issue } from "@/lib/schemas/report";

interface IssueCardProps {
  issue: Issue;
  index: number;
}

const OWNER_LABELS: Record<Issue["owner"], string> = {
  founder: "Founder",
  designer: "Designer",
  developer: "Developer",
  growth: "Growth",
};

export function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 space-y-4 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center text-sm font-bold text-slate-400">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <SeverityBadge severity={issue.severity} />
            <span className="text-xs text-slate-500 border border-navy-700 px-2 py-0.5 rounded-full">
              {issue.category}
            </span>
            <span className="text-xs text-slate-500 border border-navy-700 px-2 py-0.5 rounded-full">
              {OWNER_LABELS[issue.owner]}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-100 leading-snug">
            {issue.title}
          </h3>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Why it matters
          </p>
          <p className="text-slate-300 leading-relaxed">{issue.why_it_matters}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Evidence
          </p>
          <p className="text-slate-400 leading-relaxed italic">{issue.evidence}</p>
        </div>

        <div className="border-t border-navy-800 pt-3 space-y-1">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Recommended fix
          </p>
          <p className="text-slate-200 leading-relaxed">{issue.recommended_fix}</p>
        </div>
      </div>
    </div>
  );
}
