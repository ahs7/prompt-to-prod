import Link from "next/link";
import { URLInput } from "@/components/landing/URLInput";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-navy-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-100">Prompt-to-Prod</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/demo" className="text-slate-400 hover:text-slate-200 transition-colors">
              See a demo
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
              Recent scans
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="max-w-3xl space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Website audits live — no account needed
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 leading-tight">
              Find out why your product{" "}
              <span className="gradient-text">isn't converting</span>
              {" "}— and exactly what to fix first.
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              Paste your URL. Get a structured readiness audit in under 60 seconds.{" "}
              <span className="text-slate-300 font-medium">Free.</span>
            </p>

            {/* Input */}
            <div className="flex justify-center pt-4">
              <URLInput />
            </div>
          </div>
        </section>

        {/* Value pillars */}
        <section className="border-t border-navy-800 px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-10">
              What gets audited
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <PillarCard
                icon="🚀"
                title="Ready for users"
                description="Performance, accessibility, technical modernity, and reliability signals — the foundation that determines whether users stick around."
              />
              <PillarCard
                icon="💰"
                title="Ready for revenue"
                description="Messaging clarity, pricing transparency, conversion flow, and monetization signals. Can visitors understand what they're buying and why?"
              />
              <PillarCard
                icon="📈"
                title="Ready for scale"
                description="Analytics readiness, SEO basics, trust and social proof, and the signals that determine whether growth tactics will compound."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-navy-800 px-6 py-16 bg-navy-900/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 text-center mb-10">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[
                { step: "1", label: "Paste your URL", detail: "Any public website or web app. No login needed." },
                { step: "2", label: "We analyze it", detail: "Messaging, trust, performance, SEO, conversion signals — all in one pass." },
                { step: "3", label: "Get your report", detail: "Scores, ranked issues, and a 7/30/90 day fix roadmap." },
                { step: "4", label: "Start fixing", detail: "Clear owner, fix, and commercial impact for every issue." },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honest scope + coming soon */}
        <section className="border-t border-navy-800 px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">What this audit covers</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                This scan analyzes only what is <span className="text-slate-400 font-medium">publicly visible</span> — your homepage, key pages, meta data, performance signals, and conversion indicators.
                If your app requires login, auth-gated features are flagged as uncertainties, not scored as failures.
                This is not a code audit, security audit, or backend review.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">
                On the roadmap
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ComingSoonCard
                  tag="Phase 2"
                  title="Mobile App Listing Audits"
                  description="App Store and Google Play listing quality, screenshot narrative, review signals, and positioning clarity."
                />
                <ComingSoonCard
                  tag="Phase 3"
                  title="Deep Mobile App Audits"
                  description="Onboarding flows, retention signals, paywall effectiveness, crash patterns, and instrumentation quality."
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© 2024 Prompt-to-Prod. Built for founders.</span>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="hover:text-slate-400 transition-colors">Demo report</Link>
            <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Recent scans</Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PillarCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-navy-900/50 border border-navy-800 rounded-xl p-6 space-y-3 hover:border-indigo-500/20 transition-colors">
      <div className="text-2xl">{icon}</div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ComingSoonCard({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-navy-800 rounded-xl p-5 space-y-2 opacity-60">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 border border-navy-700 px-2 py-0.5 rounded-full">
          {tag}
        </span>
        <span className="text-xs text-slate-600">Coming soon</span>
      </div>
      <h4 className="text-sm font-semibold text-slate-400">{title}</h4>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
