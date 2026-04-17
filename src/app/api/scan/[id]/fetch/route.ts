import { type NextRequest, NextResponse } from "next/server";
import { normalizeUrl, ScanError } from "@/server/scan/normalizeUrl";
import { extractPageData } from "@/server/scan/extractors";
import { crawlSite } from "@/server/scan/crawler";
import { deriveHeuristicSignals } from "@/server/scan/lighthouse";
import { computeHeuristics } from "@/server/scan/heuristics";
import { dbGetScan, dbUpdateScan } from "@/server/db/client";

// Node.js runtime — must finish inside Vercel's 10 s limit.
// We keep this well under by: parallel fetch+crawl, no external APIs.
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 6_000;

async function fetchMainPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PromptToProd/1.0; +https://prompttoprod.com/bot)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (res.status === 401 || res.status === 403) {
      throw new ScanError(
        `Auth ${res.status}`,
        "AUTH_REQUIRED",
        "This page requires login and can't be scanned. Try a public URL."
      );
    }
    if (!res.ok) {
      throw new ScanError(
        `HTTP ${res.status}`,
        "HTTP_ERROR",
        "We couldn't reach this URL. Check it's publicly accessible and try again."
      );
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) {
      throw new ScanError(
        `Non-HTML: ${ct}`,
        "NON_HTML",
        "Only HTML pages can be scanned. Try the main website URL."
      );
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const scan = await dbGetScan(id);
  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  // Idempotent — if crawl_summary already saved, skip re-fetching
  if (scan.crawl_summary && scan.status !== "queued") {
    return NextResponse.json({ ok: true, cached: true });
  }

  let url: string;
  try {
    url = normalizeUrl(scan.url);
  } catch (err) {
    const msg =
      err instanceof ScanError ? err.userMessage : "Invalid URL.";
    await dbUpdateScan(id, {
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await dbUpdateScan(id, { status: "scanning" });

    // Run page fetch and shallow crawl in parallel to save time
    const [html, crawlSummary] = await Promise.all([
      fetchMainPage(url),
      crawlSite(url),
    ]);

    const pageData = extractPageData(html, url);
    // Use heuristics only — no external PageSpeed API call here (keeps us under 10 s)
    const perfSignals = deriveHeuristicSignals(pageData);
    const heuristics = computeHeuristics(pageData, crawlSummary, perfSignals);

    // Persist everything the analyze stage needs
    await dbUpdateScan(id, {
      crawl_summary: {
        url,
        page: pageData,
        crawl: {
          baseUrl: crawlSummary.baseUrl,
          crawledAt: crawlSummary.crawledAt,
          results: crawlSummary.results.map((r) => ({
            path: r.path,
            status: r.status,
            hasData: !!r.data,
          })),
          pagesFound: crawlSummary.results.filter((r) => r.status === "found")
            .length,
        },
        performance: perfSignals,
        heuristics,
      } as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg =
      err instanceof ScanError
        ? err.userMessage
        : err instanceof Error
        ? err.message
        : "Fetch stage failed.";
    await dbUpdateScan(id, {
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
