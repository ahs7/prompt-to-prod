import Link from "next/link";

interface CTACardProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaRef: string;
  accent: string;
}

function CTACard({
  title,
  subtitle,
  description,
  ctaText,
  ctaRef,
  accent,
}: CTACardProps) {
  return (
    <div
      className={`bg-navy-900 border rounded-xl p-6 space-y-4 flex flex-col ${accent}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {subtitle}
        </p>
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">{description}</p>
      <Link
        href={`/contact?ref=${ctaRef}`}
        className={`inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80 ${accent.replace("border-", "text-")}`}
      >
        {ctaText}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

export function CTABlocks() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Take the Next Step</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CTACard
          subtitle="Need a deeper look?"
          title="Deep Audit"
          description="Our deep audit covers your codebase, architecture, auth flows, data model, and deployment — not just what's publicly visible."
          ctaText="Request Deep Audit"
          ctaRef="deep-audit"
          accent="border-indigo-500/30 text-indigo-400"
        />
        <CTACard
          subtitle="Want this fixed for you?"
          title="Rescue Sprint"
          description="Fixed-scope rescue sprints tackle your top 3–5 critical issues in 2 weeks. Guaranteed scope. Flat rate."
          ctaText="See Rescue Packages"
          ctaRef="rescue-sprint"
          accent="border-emerald-500/30 text-emerald-400"
        />
        <CTACard
          subtitle="Keep it healthy over time."
          title="Monitoring"
          description="Weekly automated scans catch regressions before your users do."
          ctaText="Join Monitoring Waitlist"
          ctaRef="monitoring"
          accent="border-amber-500/30 text-amber-400"
        />
      </div>
    </div>
  );
}
