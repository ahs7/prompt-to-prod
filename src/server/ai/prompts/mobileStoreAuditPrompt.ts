import "server-only";

/**
 * TODO: Phase 2 — App Store / Play Store Listing Audit Prompt
 *
 * This prompt will be used for auditing mobile app store listings.
 *
 * BEFORE IMPLEMENTING:
 * - Resolve data access strategy. Options to evaluate:
 *   1. Third-party APIs: AppFollow, AppTweak, SensorTower, data.ai
 *      — These provide structured listing data but require paid subscriptions.
 *   2. Web scraping: Apple App Store and Google Play do NOT provide stable
 *      public APIs. Scraping is fragile and may violate ToS.
 *   3. Manual review workflow: User pastes listing content into our form.
 *      — Lowest friction to implement, but degrades UX.
 * - Choose a strategy and document it in docs/PRD.md before writing this prompt.
 * - The prompt should receive structured listing data, not raw HTML.
 *
 * PROPOSED OUTPUT SCHEMA (for reference when Phase 2 begins):
 * {
 *   listing_quality_score: number,          // 0-100
 *   screenshot_narrative_score: number,     // 0-100
 *   review_signal_score: number,            // 0-100
 *   positioning_clarity_score: number,      // 0-100
 *   monetization_clarity_score: number,     // 0-100
 *   top_issues: Issue[],                    // same Issue schema as Phase 1
 *   quick_wins_7_day: string[],
 *   roadmap_30_day: string[],
 *   verdict: "not_ready" | "partially_ready" | "ready_with_fixes",
 *   observed_issues: string[],
 *   inferred_risks: string[],
 *   uncertainties: string[],
 * }
 */
export const MOBILE_STORE_AUDIT_PROMPT = "NOT_IMPLEMENTED";
