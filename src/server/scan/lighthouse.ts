import "server-only";
import type { ExtractedPageData } from "./extractors";

export interface PerformanceSignals {
  source: "pagespeed" | "heuristic";
  scores?: {
    performance?: number;
    accessibility?: number;
    seo?: number;
    best_practices?: number;
  };
  topAudits?: string[];
  heuristic?: {
    renderBlockingScripts: number;
    imagesWithoutAlt: number;
    hasViewportMeta: boolean;
    hasLangAttribute: boolean;
    hasMixedContent: boolean;
    inlineStyleKB: number;
    hasStructuredData: boolean;
    hasOpenGraph: boolean;
    totalImages: number;
    formLabelsCount: number;
    estimatedScore: number;
  };
}

const PAGESPEED_API_BASE =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

async function callPageSpeedAPI(
  url: string,
  apiKey: string
): Promise<PerformanceSignals> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy: "mobile",
    category: ["performance", "accessibility", "seo", "best-practices"].join(
      "&category="
    ),
  });

  const response = await fetch(`${PAGESPEED_API_BASE}?${params}`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`PageSpeed API returned ${response.status}`);
  }

  const data = await response.json();
  const categories = data.lighthouseResult?.categories ?? {};
  const audits = data.lighthouseResult?.audits ?? {};

  const scores = {
    performance: Math.round((categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
    seo: Math.round((categories.seo?.score ?? 0) * 100),
    best_practices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
  };

  const topAudits: string[] = Object.values(audits)
    .filter(
      (a: unknown) =>
        typeof a === "object" &&
        a !== null &&
        "score" in a &&
        (a as { score: number }).score !== null &&
        (a as { score: number }).score < 0.9 &&
        "title" in a
    )
    .slice(0, 5)
    .map((a: unknown) => (a as { title: string }).title);

  return { source: "pagespeed", scores, topAudits };
}

function deriveHeuristicSignals(
  page: ExtractedPageData
): PerformanceSignals {
  const {
    renderBlockingScripts,
    imagesWithoutAlt,
    hasViewportMeta,
    hasLangAttribute,
    hasMixedContent,
    inlineStyleCharCount,
    hasStructuredData,
    hasOpenGraph,
    totalImages,
    formLabelsCount,
  } = page;

  // Simple heuristic score: start at 100, subtract for issues
  let score = 100;
  score -= renderBlockingScripts * 10; // up to -50
  const altCoverage = totalImages > 0 ? imagesWithoutAlt / totalImages : 0;
  score -= Math.round(altCoverage * 20); // up to -20
  if (!hasViewportMeta) score -= 15;
  if (!hasLangAttribute) score -= 5;
  if (hasMixedContent) score -= 10;
  if (inlineStyleCharCount > 50_000) score -= 5;
  if (!hasStructuredData) score -= 5;
  if (!hasOpenGraph) score -= 5;
  const estimatedScore = Math.max(0, Math.min(100, score));

  return {
    source: "heuristic",
    heuristic: {
      renderBlockingScripts,
      imagesWithoutAlt,
      hasViewportMeta,
      hasLangAttribute,
      hasMixedContent,
      inlineStyleKB: Math.round(inlineStyleCharCount / 1024),
      hasStructuredData,
      hasOpenGraph,
      totalImages,
      formLabelsCount,
      estimatedScore,
    },
  };
}

/**
 * Gets performance signals. Uses PageSpeed API if available, falls back to
 * heuristic analysis from the extracted HTML data.
 */
export async function getPerformanceSignals(
  url: string,
  page: ExtractedPageData
): Promise<PerformanceSignals> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (apiKey) {
    try {
      return await callPageSpeedAPI(url, apiKey);
    } catch (err) {
      console.error("[lighthouse] PageSpeed API failed, using heuristics:", err);
      // Silent fallback — no user-visible error
    }
  }

  return deriveHeuristicSignals(page);
}
