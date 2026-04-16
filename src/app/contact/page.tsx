import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

interface Props {
  searchParams: { ref?: string };
}

const PACKAGE_LABELS: Record<string, { title: string; description: string }> = {
  "deep-audit": {
    title: "Deep Audit",
    description:
      "Full codebase, architecture, auth flows, data model, and deployment review — not just what's publicly visible.",
  },
  "rescue-sprint": {
    title: "Rescue Sprint",
    description:
      "Fixed-scope, 2-week sprint to tackle your top 3–5 critical issues. Guaranteed scope. Flat rate.",
  },
  monitoring: {
    title: "Monitoring",
    description:
      "Weekly automated scans to catch regressions before your users do.",
  },
};

export default function ContactPage({ searchParams }: Props) {
  const ref = searchParams.ref ?? "";
  const pkg = PACKAGE_LABELS[ref] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-navy-800 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-100">Prompt-to-Prod</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16 space-y-8">
        {pkg ? (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-5 space-y-2">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              You're inquiring about
            </p>
            <h2 className="text-lg font-bold text-slate-100">{pkg.title}</h2>
            <p className="text-sm text-slate-400">{pkg.description}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-100">Get in Touch</h1>
          <p className="text-sm text-slate-500">
            This page is a placeholder. In a production deployment, this would connect to a contact form, Cal.com booking link, or intake form.
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 space-y-4">
          <p className="text-sm text-slate-400">
            For now, reach out directly at:{" "}
            <span className="text-indigo-300 font-mono">hello@prompttoprod.com</span>
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Include your product URL, which package you're interested in, and a brief description of your biggest pain point.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
