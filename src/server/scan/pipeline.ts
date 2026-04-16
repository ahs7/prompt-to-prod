import "server-only";
import { v4 as uuidv4 } from "uuid";
import { ScanError, normalizeUrl } from "./normalizeUrl";
import { extractPageData } from "./extractors";
import { crawlSite } from "./crawler";
import { getPerformanceSignals } from "./lighthouse";
import { captureScreenshot } from "./screenshots";
import { computeHeuristics } from "./heuristics";
import {
  QUICK_SCAN_SYSTEM_PROMPT,
  buildQuickScanUserPrompt,
} from "@/server/ai/prompts/quickScanPrompt";
import { callAI, NoProviderError } from "@/server/ai/provider";
import { ReportSchema } from "@/lib/schemas/report";
import { dbCreateScan, dbUpdateScan, dbCreateReport } from "@/server/db/client";
import { demoReport } from "@/server/data/seed/demoReport";
import type { Report } from "@/lib/schemas/report";
import type { Scan, ReportRecord } from "@/lib/schemas/scan";

export interface PipelineResult {
  scanId: string;
  reportId: string;
  isMock: boolean;
}

const FETCH_TIMEOUT_MS = 15_000;

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PromptToProd/1.0; +https://prompttoprod.com/bot)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (response.status === 401 || response.status === 403) {
      throw new ScanError(
        `Auth required: ${response.status}`,
        "AUTH_REQUIRED",
        "This page requires login and can't be scanned. Try a public URL."
      );
    }

    if (!response.ok) {
      throw new ScanError(
        `HTTP ${response.status}`,
        "HTTP_ERROR",
        "We couldn't reach this URL. Check it's publicly accessible and try again."
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new ScanError(
        `Non-HTML: ${contentType}`,
        "NON_HTML",
        "Only HTML pages can be scanned. Try the main website URL."
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function buildMockReport(url: string): Report {
  // Return demo report structure with URL customized
  return {
    ...demoReport,
    executive_summary: `This is an estimated report for ${url} — live AI analysis is temporarily unavailable. The findings below are based on common patterns for sites at this stage. Run a fresh scan when the service is restored for accurate results.`,
  };
}

/**
 * Runs the full scan pipeline for a URL.
 * Updates scan status in DB throughout.
 * Returns scanId and reportId.
 */
export async function runScanPipeline(
  rawUrl: string,
  scanId: string
): Promise<PipelineResult> {
  const reportId = uuidv4();
  let isMock = false;

  try {
    // Stage 1: Normalize URL
    const url = normalizeUrl(rawUrl);

    await dbUpdateScan(scanId, {
      status: "scanning",
    });

    // Stage 2: Fetch and extract main page
    const html = await fetchPage(url);
    const pageData = extractPageData(html, url);

    // Stage 3: Shallow crawl
    const crawlSummary = await crawlSite(url);

    // Stage 4: Performance signals
    const perfSignals = await getPerformanceSignals(url, pageData);

    // Stage 5: Screenshot (graceful skip)
    const screenshot = await captureScreenshot(url, scanId);

    // Stage 6: Heuristic pre-scores
    const heuristics = computeHeuristics(pageData, crawlSummary, perfSignals);

    // Assemble scan payload for AI
    const scanPayload = {
      url,
      scannedAt: new Date().toISOString(),
      page: pageData,
      crawl: {
        results: crawlSummary.results.map((r) => ({
          path: r.path,
          status: r.status,
          hasData: !!r.data,
        })),
        pagesFound: crawlSummary.results.filter((r) => r.status === "found").length,
      },
      performance: perfSignals,
      heuristicScores: heuristics,
    };

    // Stage 6: AI Report Generation
    let report: Report;

    try {
      const userPrompt = buildQuickScanUserPrompt(
        JSON.stringify(scanPayload, null, 2)
      );
      const rawResponse = await callAI(QUICK_SCAN_SYSTEM_PROMPT, userPrompt);

      // Strip any markdown code fences if present
      const cleaned = rawResponse
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Retry with correction instruction
        const correctionPrompt =
          buildQuickScanUserPrompt(JSON.stringify(scanPayload)) +
          "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the raw JSON object with no markdown, no code fences, no explanation.";
        const retryResponse = await callAI(QUICK_SCAN_SYSTEM_PROMPT, correctionPrompt);
        const retryCleaned = retryResponse
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        parsed = JSON.parse(retryCleaned);
      }

      report = ReportSchema.parse(parsed);
    } catch (err) {
      if (err instanceof NoProviderError) {
        console.log("[pipeline] No AI provider configured, using mock report");
      } else {
        console.error("[pipeline] AI generation failed, using mock report:", err);
      }
      report = buildMockReport(url);
      isMock = true;
    }

    // Save completed scan
    await dbUpdateScan(scanId, {
      status: "complete",
      completed_at: new Date().toISOString(),
      crawl_summary: crawlSummary as unknown as Record<string, unknown>,
      pagespeed_raw:
        perfSignals.source === "pagespeed"
          ? (perfSignals as unknown as Record<string, unknown>)
          : null,
      screenshot_url: screenshot.url,
    });

    // Save report — embed is_mock flag in report_json for banner display
    const reportRecord: ReportRecord = {
      id: reportId,
      scan_id: scanId,
      url,
      scan_type: "web",
      report_json: {
        ...(report as unknown as Record<string, unknown>),
        is_mock: isMock,
      },
      verdict: report.verdict,
      score_production: report.scores.production_readiness,
      score_growth: report.scores.growth_readiness,
      score_trust: report.scores.trust_conversion,
      is_demo: false,
      created_at: new Date().toISOString(),
    };

    await dbCreateReport(reportRecord);

    return { scanId, reportId, isMock };
  } catch (err) {
    const errorMessage =
      err instanceof ScanError
        ? err.userMessage
        : err instanceof Error
        ? err.message
        : "Scan failed";

    await dbUpdateScan(scanId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
    });

    throw err;
  }
}

/**
 * Creates a scan record and starts the pipeline in the background.
 * Returns the scanId immediately.
 */
export async function createAndStartScan(rawUrl: string): Promise<string> {
  const scanId = uuidv4();

  const scan: Scan = {
    id: scanId,
    url: rawUrl,
    status: "queued",
    scan_type: "web",
    created_at: new Date().toISOString(),
    completed_at: null,
    crawl_summary: null,
    pagespeed_raw: null,
    screenshot_url: null,
    error_message: null,
  };

  await dbCreateScan(scan);

  // Run pipeline in background (non-blocking)
  runScanPipeline(rawUrl, scanId).catch((err) => {
    console.error(`[pipeline] Background scan ${scanId} failed:`, err);
  });

  return scanId;
}
