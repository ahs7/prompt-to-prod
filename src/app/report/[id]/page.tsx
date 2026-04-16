import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { dbGetReport } from "@/server/db/client";
import { ReportSchema } from "@/lib/schemas/report";
import { ScoreSection } from "@/components/report/ScoreSection";
import { IssueCard } from "@/components/report/IssueCard";
import { RoadmapSection } from "@/components/report/RoadmapSection";
import { CTABlocks } from "@/components/report/CTABlocks";
import { formatUrl, getVerdictLabel } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await dbGetReport(params.id);
  if (!record) return { title: "Report not found" };
  return {
    title: `Audit: ${formatUrl(record.url)}`,
    description: `Readiness audit for ${record.url} — ${getVerdictLabel(record.verdict)}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const record = await dbGetReport(params.id);
  if (!record) notFound();

  const parsed = ReportSchema.safeParse(record.report_json);
  if (!parsed.success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <p className="text-rose-400 text-lg font-semibold">Report data is malformed.</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">
            ← Run a new scan
          </Link>
        </div>
      </div>
    );
  }

  const report = parsed.data;
  const isMockBanner =
    record.report_json &&
    typeof record.report_json === "object" &&
    "is_mock" in record.report_json &&
    record.report_json.is_mock;

  const isDemoBanner = record.is_demo;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-navy-800 px-6 py-4 sticky top-0 z-10 bg-navy-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-100">Prompt-to-Prod</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-mono truncate max-w-[200px] hidden sm:block">
              {formatUrl(record.url)}
            </span>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-navy-800 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 transition-colors text-xs"
            >
              Scan another →
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Banners */}
        {isDemoBanner && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-3 text-sm text-indigo-300">
            <strong>Demo report.</strong> This is a sample audit to show what Prompt-to-Prod produces.{" "}
            <Link href="/" className="underline hover:text-indigo-200">
              Scan your own product →
            </Link>
          </div>
        )}
        {!isDemoBanner && isMockBanner && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 text-sm text-amber-300">
            <strong>Estimated report.</strong> Live AI analysis was temporarily unavailable. This report is based on common patterns — run a fresh scan for accurate results.
          </div>
        )}

        {/* Report header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Readiness Audit
          </p>
          <h1 className="text-2xl font-black text-slate-100 break-all">
            {formatUrl(record.url)}
          </h1>
          <p className="text-xs text-slate-600">
            Scanned {new Date(record.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
            {" "}· Only publicly visible content was analyzed.
          </p>
        </div>

        {/* Scores + verdict */}
        <ScoreSection report={report} />

        {/* Issues */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">
              Top Issues{" "}
              <span className="text-sm font-normal text-slate-500">
                ranked by business impact
              </span>
            </h2>
            <span className="text-xs text-slate-600">
              {report.top_issues.length} issues found
            </span>
          </div>
          <div className="space-y-3">
            {report.top_issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i} />
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <RoadmapSection
          quickWins={report.quick_wins_7_day}
          roadmap30={report.roadmap_30_day}
          roadmap90={report.roadmap_90_day}
        />

        {/* Observations, risks, uncertainties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ObservationList
            title="Observed"
            items={report.observed_issues}
            color="text-slate-300"
          />
          <ObservationList
            title="Inferred Risks"
            items={report.inferred_risks}
            color="text-amber-400"
          />
          <ObservationList
            title="Not Assessed"
            items={report.uncertainties}
            color="text-slate-500"
          />
        </div>

        {/* Next actions */}
        {report.next_actions.length > 0 && (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
              Your next actions
            </h2>
            <ol className="space-y-2">
              {report.next_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* CTA blocks */}
        <CTABlocks />

        {/* Share */}
        <div className="text-center space-y-2 py-4">
          <p className="text-xs text-slate-600">Share this report</p>
          <p className="text-sm font-mono text-slate-500 break-all">
            {process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/report/{record.id}
          </p>
        </div>
      </main>

      <footer className="border-t border-navy-800 px-6 py-6 mt-10">
        <div className="max-w-6xl mx-auto text-xs text-slate-600 text-center">
          This audit only analyzes publicly visible content. It is not a security audit, code review, or guarantee of product quality.
        </div>
      </footer>
    </div>
  );
}

function ObservationList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 space-y-3">
      <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
            <span className={`mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-current ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
