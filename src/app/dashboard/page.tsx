import type { Metadata } from "next";
import Link from "next/link";
import { dbListReports } from "@/server/db/client";
import { formatUrl, getVerdictLabel, getVerdictColor, getScoreColor, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Recent Scans",
};

// Revalidate every 30 seconds
export const revalidate = 30;

export default async function DashboardPage() {
  const reports = await dbListReports(20);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-navy-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-100">Prompt-to-Prod</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            New scan →
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-100">Recent Scans</h1>
            <p className="text-sm text-slate-500 mt-1">
              All scans are public and shareable. No account required.
            </p>
          </div>
          <span className="text-xs text-slate-600">{reports.length} scans</span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-slate-500 text-base">No scans yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Run your first scan →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="block bg-navy-900 border border-navy-800 hover:border-indigo-500/30 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-slate-100 transition-colors">
                      {formatUrl(report.url)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getVerdictColor(report.verdict)}`}
                      >
                        {getVerdictLabel(report.verdict)}
                      </span>
                      <span className="text-xs text-slate-600">
                        {timeAgo(report.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {[
                      { label: "Prod", score: report.score_production },
                      { label: "Growth", score: report.score_growth },
                      { label: "Trust", score: report.score_trust },
                    ].map((s) =>
                      s.score != null ? (
                        <div key={s.label} className="text-center hidden sm:block">
                          <p
                            className={`text-lg font-bold tabular-nums ${getScoreColor(s.score)}`}
                          >
                            {s.score}
                          </p>
                          <p className="text-xs text-slate-600">{s.label}</p>
                        </div>
                      ) : null
                    )}
                    <svg
                      className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
