import "server-only";

/**
 * TODO: Phase 3 — Deep Mobile Application Audit Prompt
 *
 * This prompt will be used for deep audits of mobile applications.
 * DO NOT IMPLEMENT until Phase 2 is live and validated.
 *
 * Phase 3 is effectively a separate product surface from Phase 1 and 2.
 * It requires:
 * - APK/IPA static analysis tooling
 * - Onboarding flow recording/replay infrastructure
 * - Analytics export parsing (Amplitude, Mixpanel, Firebase, etc.)
 * - Crash report ingestion (Sentry, Crashlytics, Firebase Crashlytics)
 * - OAuth integrations with app stores and analytics platforms
 * - Paywall completion funnel data
 *
 * INPUTS (when Phase 3 is implemented):
 * - APK/IPA analysis output (from static analysis pipeline)
 * - Onboarding session recordings or frame captures
 * - Analytics exports (event schema, funnel data, retention curves)
 * - Crash reports summary
 * - App Store / Play Store metadata (from Phase 2 pipeline)
 *
 * PROPOSED OUTPUT SCHEMA:
 * {
 *   onboarding_score: number,              // 0-100
 *   retention_readiness_score: number,     // 0-100
 *   paywall_effectiveness_score: number,   // 0-100
 *   crash_stability_score: number,         // 0-100
 *   instrumentation_quality_score: number, // 0-100
 *   top_issues: Issue[],
 *   quick_wins_7_day: string[],
 *   roadmap_30_day: string[],
 *   roadmap_90_day: string[],
 *   verdict: "not_ready" | "partially_ready" | "ready_with_fixes",
 *   observed_issues: string[],
 *   inferred_risks: string[],
 *   uncertainties: string[],
 * }
 *
 * See docs/roadmap.md for full Phase 3 product vision.
 */
export const DEEP_MOBILE_AUDIT_PROMPT = "NOT_IMPLEMENTED";
