import "server-only";
import type { ExtractedPageData } from "./extractors";
import type { CrawlSummary } from "./crawler";
import type { PerformanceSignals } from "./lighthouse";

export interface HeuristicScores {
  messagingClarity: number; // 0–100
  mobileUX: number;
  performance: number;
  accessibility: number;
  trustCredibility: number;
  conversionReadiness: number;
  analyticsReadiness: number;
  seoBasics: number;
  technicalModernity: number;
  monetizationSignals: number;
  /** Weighted composite, used as input to AI — not final score */
  weightedComposite: number;
}

const WEIGHTS = {
  messagingClarity: 0.15,
  mobileUX: 0.10,
  performance: 0.15,
  accessibility: 0.10,
  trustCredibility: 0.15,
  conversionReadiness: 0.10,
  analyticsReadiness: 0.05,
  seoBasics: 0.10,
  technicalModernity: 0.05,
  monetizationSignals: 0.05,
};

function scoreMessagingClarity(page: ExtractedPageData): number {
  let score = 0;
  const h1 = page.headings.find((h) => h.level === 1);
  if (h1 && h1.text.length > 10) score += 30;
  if (h1 && h1.text.length > 30) score += 10;
  if (page.metaDescription && page.metaDescription.length > 50) score += 25;
  if (page.wordCount > 200) score += 20;
  if (page.wordCount > 500) score += 10;
  if (page.headings.filter((h) => h.level === 2).length >= 2) score += 5;
  return Math.min(100, score);
}

function scoreMobileUX(page: ExtractedPageData): number {
  let score = 0;
  if (page.hasViewportMeta) score += 50;
  // Heuristic: if word count is reasonable and no massive inline styles, probably ok
  if (page.inlineStyleCharCount < 100_000) score += 20;
  if (page.ctaTexts.length > 0) score += 15;
  // If page has framework hints (likely modern responsive framework)
  if (
    page.stackHints.some((h) =>
      ["Next", "Nuxt", "Gatsby", "Webflow", "Framer"].includes(h)
    )
  )
    score += 15;
  return Math.min(100, score);
}

function scorePerformance(perf: PerformanceSignals): number {
  if (perf.source === "pagespeed" && perf.scores?.performance !== undefined) {
    return perf.scores.performance;
  }
  if (perf.source === "heuristic" && perf.heuristic) {
    return perf.heuristic.estimatedScore;
  }
  return 50; // neutral default
}

function scoreAccessibility(page: ExtractedPageData, perf: PerformanceSignals): number {
  if (perf.source === "pagespeed" && perf.scores?.accessibility !== undefined) {
    return perf.scores.accessibility;
  }
  let score = 60; // start at reasonable baseline
  if (!page.hasLangAttribute) score -= 15;
  const altCoverage =
    page.totalImages > 0
      ? 1 - page.imagesWithoutAlt / page.totalImages
      : 1;
  score += Math.round(altCoverage * 20);
  if (page.forms.count > 0 && page.formLabelsCount >= page.forms.count) score += 10;
  if (page.forms.count > 0 && page.formLabelsCount === 0) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function scoreTrustCredibility(page: ExtractedPageData): number {
  let score = 10; // baseline
  score += Math.min(40, page.trustSignals.length * 8);
  if (page.contactSignals.hasEmail) score += 15;
  if (page.contactSignals.hasPhone) score += 10;
  if (page.contactSignals.hasAddress) score += 10;
  if (page.socialLinks.length > 0) score += 10;
  if (page.socialLinks.length >= 3) score += 5;
  return Math.min(100, score);
}

function scoreConversionReadiness(
  page: ExtractedPageData,
  crawl: CrawlSummary
): number {
  let score = 0;
  if (page.ctaTexts.length >= 1) score += 20;
  if (page.ctaTexts.length >= 3) score += 10;
  if (page.forms.count >= 1) score += 20;
  // Pricing page detected in crawl
  const hasPricingPage = crawl.results.some(
    (r) => r.path === "/pricing" && r.status === "found"
  );
  if (hasPricingPage || page.pricingSignals.length > 0) score += 25;
  // Signup/register page detected
  const hasSignup = crawl.results.some(
    (r) =>
      ["/signup", "/register"].includes(r.path) && r.status === "found"
  );
  if (hasSignup) score += 15;
  if (page.forms.submitTexts.length > 0) score += 10;
  return Math.min(100, score);
}

function scoreAnalyticsReadiness(page: ExtractedPageData): number {
  if (page.analyticsHints.length === 0) return 0;
  let score = 40;
  // GA4 or GTM are more comprehensive
  if (
    page.analyticsHints.some((a) => ["GA4", "GTM", "Segment"].includes(a))
  )
    score += 30;
  if (page.analyticsHints.length >= 2) score += 20;
  if (page.analyticsHints.length >= 3) score += 10;
  return Math.min(100, score);
}

function scoreSEOBasics(page: ExtractedPageData, perf: PerformanceSignals): number {
  if (perf.source === "pagespeed" && perf.scores?.seo !== undefined) {
    return perf.scores.seo;
  }
  let score = 0;
  if (page.title) score += 20;
  if (page.metaDescription) score += 20;
  if (page.headings.some((h) => h.level === 1)) score += 20;
  if (page.hasOpenGraph) score += 15;
  if (page.hasStructuredData) score += 15;
  if (page.hasLangAttribute) score += 10;
  return Math.min(100, score);
}

function scoreTechnicalModernity(page: ExtractedPageData): number {
  let score = 40; // baseline
  if (page.stackHints.some((h) =>
    ["Next", "Nuxt", "Gatsby", "Framer", "Webflow"].includes(h)
  ))
    score += 30;
  if (!page.hasMixedContent) score += 15;
  if (page.hasStructuredData) score += 15;
  // Penalize WordPress slightly (often outdated)
  if (page.stackHints.includes("WordPress")) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function scoreMonetizationSignals(
  page: ExtractedPageData,
  crawl: CrawlSummary
): number {
  let score = 0;
  const hasPricingPage = crawl.results.some(
    (r) => r.path === "/pricing" && r.status === "found"
  );
  if (hasPricingPage) score += 40;
  if (page.pricingSignals.length > 0) score += 20;
  if (
    page.pricingSignals.some((s) =>
      /per month|\/mo|subscribe|upgrade/i.test(s)
    )
  )
    score += 20;
  if (page.forms.count > 0) score += 10;
  if (page.ctaTexts.some((t) => /start|try|get|sign up|join/i.test(t)))
    score += 10;
  return Math.min(100, score);
}

/**
 * Computes heuristic pre-scores from extracted data.
 * These are INPUTS to the AI, not final scores.
 */
export function computeHeuristics(
  page: ExtractedPageData,
  crawl: CrawlSummary,
  perf: PerformanceSignals
): HeuristicScores {
  const scores = {
    messagingClarity: scoreMessagingClarity(page),
    mobileUX: scoreMobileUX(page),
    performance: scorePerformance(perf),
    accessibility: scoreAccessibility(page, perf),
    trustCredibility: scoreTrustCredibility(page),
    conversionReadiness: scoreConversionReadiness(page, crawl),
    analyticsReadiness: scoreAnalyticsReadiness(page),
    seoBasics: scoreSEOBasics(page, perf),
    technicalModernity: scoreTechnicalModernity(page),
    monetizationSignals: scoreMonetizationSignals(page, crawl),
  };

  const weightedComposite = Math.round(
    scores.messagingClarity * WEIGHTS.messagingClarity +
      scores.mobileUX * WEIGHTS.mobileUX +
      scores.performance * WEIGHTS.performance +
      scores.accessibility * WEIGHTS.accessibility +
      scores.trustCredibility * WEIGHTS.trustCredibility +
      scores.conversionReadiness * WEIGHTS.conversionReadiness +
      scores.analyticsReadiness * WEIGHTS.analyticsReadiness +
      scores.seoBasics * WEIGHTS.seoBasics +
      scores.technicalModernity * WEIGHTS.technicalModernity +
      scores.monetizationSignals * WEIGHTS.monetizationSignals
  );

  return { ...scores, weightedComposite };
}
