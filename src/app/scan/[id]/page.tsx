import type { Metadata } from "next";
import { ProgressIndicator } from "@/components/scan/ProgressIndicator";

export const metadata: Metadata = {
  title: "Scanning...",
};

interface Props {
  params: { id: string };
  searchParams: { url?: string };
}

export default function ScanPage({ params, searchParams }: Props) {
  const url = searchParams.url ? decodeURIComponent(searchParams.url) : "your URL";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-navy-800 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-100">Prompt-to-Prod</span>
          </a>
        </div>
      </nav>

      {/* Progress */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <ProgressIndicator scanId={params.id} url={url} />
        </div>
      </main>
    </div>
  );
}
