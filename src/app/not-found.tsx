import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="space-y-2">
        <p className="text-5xl font-black text-indigo-500">404</p>
        <h1 className="text-2xl font-bold text-slate-100">Page not found</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          The report or page you're looking for doesn't exist or may have been removed.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Run a new scan →
        </Link>
        <Link
          href="/demo"
          className="px-5 py-2.5 rounded-xl border border-navy-800 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          See demo report
        </Link>
      </div>
    </div>
  );
}
