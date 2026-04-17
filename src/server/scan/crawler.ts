import "server-only";
import { extractPageData, type ExtractedPageData } from "./extractors";

export type CrawlStatus = "found" | "404" | "timeout" | "error" | "skipped";

export interface CrawlResult {
  path: string;
  status: CrawlStatus;
  statusCode?: number;
  data?: ExtractedPageData;
  error?: string;
}

export interface CrawlSummary {
  baseUrl: string;
  crawledAt: string;
  results: CrawlResult[];
}

const CRAWL_PATHS = [
  "/pricing",
  "/features",
  "/about",
];

// Kept tight so the fetch stage completes well inside Vercel's 10 s limit
const TOTAL_CRAWL_TIMEOUT_MS = 5_000;
const PER_PAGE_TIMEOUT_MS = 2_500;

async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PromptToProd/1.0; +https://prompttoprod.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Shallow-crawls up to 3 key pages on the same domain.
 * Total timeout: 5 seconds across all crawl attempts.
 */
export async function crawlSite(baseUrl: string): Promise<CrawlSummary> {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const startTime = Date.now();
  const results: CrawlResult[] = [];

  const paths = CRAWL_PATHS;

  for (const path of paths) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= TOTAL_CRAWL_TIMEOUT_MS) {
      results.push({ path, status: "skipped", error: "Total timeout reached" });
      continue;
    }

    const remaining = TOTAL_CRAWL_TIMEOUT_MS - elapsed;
    const perPageTimeout = Math.min(PER_PAGE_TIMEOUT_MS, remaining);
    const url = `${origin}${path}`;

    try {
      const response = await fetchWithTimeout(url, perPageTimeout);

      if (response.status === 404) {
        results.push({ path, status: "404", statusCode: 404 });
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        results.push({ path, status: "error", statusCode: response.status, error: "Requires authentication" });
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        results.push({ path, status: "error", statusCode: response.status, error: "Non-HTML response" });
        continue;
      }

      const html = await response.text();
      const data = extractPageData(html, url);
      results.push({ path, status: "found", statusCode: response.status, data });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("abort"))
      ) {
        results.push({ path, status: "timeout", error: "Request timed out" });
      } else {
        results.push({
          path,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
  }

  return {
    baseUrl,
    crawledAt: new Date().toISOString(),
    results,
  };
}
