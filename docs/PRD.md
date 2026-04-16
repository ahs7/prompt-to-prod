# Product Requirements Document

## Product: Prompt-to-Prod

**Version:** Phase 1 MVP  
**Last updated:** 2024

---

## Product Vision

Prompt-to-Prod tells founders exactly what to fix so what they already built can work as a business.
It is not a builder. It is a readiness auditor.

**One-sentence pitch:**
"Paste your URL. Find out why your product isn't converting, retaining, or scaling — and exactly what to fix first."

---

## Phase 1 Scoring Model

### Dimensions and Weights

| Dimension | Weight | Signals Used |
|---|---|---|
| Messaging clarity | 15% | H1 quality, meta description, above-fold copy word count |
| Mobile UX | 10% | Viewport meta, responsive CSS hints, tap target signals |
| Performance | 15% | PageSpeed score or heuristic script/image count |
| Accessibility | 10% | Alt text coverage, lang attribute, form labels |
| Trust & credibility | 15% | Trust signal count, contact info presence, social proof |
| Conversion readiness | 10% | CTA count/quality, pricing page presence, form quality |
| Analytics readiness | 5% | Analytics pixel detection |
| SEO basics | 10% | Title, meta desc, H1 presence, OG tags, structured data |
| Technical modernity | 5% | Framework signals, no mixed content, HTTPS |
| Monetization signals | 5% | Pricing page, clear offer signals |

### Three Output Scores

1. **Production Readiness (0–100):** Is the site functional, reachable, performant, technically sound?
2. **Growth Readiness (0–100):** Does it have clear messaging, CTAs, analytics, SEO, conversion flow?
3. **Trust & Conversion (0–100):** Does it build trust? Social proof, contact info, pricing clarity, form quality?

### Scoring Guardrails

- Heuristic pre-scores are inputs to the AI, not final scores.
- The AI determines final scores based on contextual analysis.
- 80+ is reserved for genuinely strong signals.
- The AI is explicitly instructed to be honest, not encouraging.

---

## Phase 2 Scoring Model (Extension Plan)

When mobile listing audits are implemented, the scoring model will be extended with:

| Dimension | Weight | Signals Used |
|---|---|---|
| Listing quality | 20% | Description clarity, keyword usage, completeness |
| Screenshot narrative | 20% | Screenshot count, caption quality, value progression |
| Review signals | 15% | Rating, review count, recency, response rate |
| Positioning clarity | 20% | Category fit, subtitle, first line hook |
| Update frequency | 10% | Last update date (stale apps signal abandoned products) |
| Monetization clarity | 15% | Pricing model, IAP clarity, free trial messaging |

**Important constraint:** This scoring model cannot be implemented until the data access
strategy for App Store / Play Store is resolved. See `src/server/mobile/storeListing/parser.ts`
for the data access options to evaluate.

The web-only dimensions (Performance, Mobile UX) would not apply to listing audits.
The listing audit produces its own score set, separate from the web audit scores.

---

## Phase 3 Scoring Model (Vision Only)

Phase 3 would add deep mobile app analysis with entirely new dimensions:

| Dimension | Focus |
|---|---|
| Onboarding score | Time-to-value, drop-off points, clarity of first session |
| Retention readiness | Day-1/7/30 retention signals, re-engagement mechanisms |
| Paywall effectiveness | Conversion rate signals, placement, friction, value clarity |
| Crash stability | Crash-free session rate, crash pattern severity |
| Instrumentation quality | Event coverage, funnel completeness, analytics hygiene |

Phase 3 inputs would include: APK/IPA analysis, session recordings, analytics exports,
crash reports, and app store metadata. This is a separate product surface — see `docs/roadmap.md`.

---

## Honest Scope Boundaries (Phase 1)

| Claim | Reality |
|---|---|
| "Onboarding clarity" | Only assessed if publicly accessible. If app requires login, flagged as uncertainty. |
| "Retention readiness" | Surface signals only (copy, email capture, notification presence). Not a retention audit. |
| "Security concerns" | Only visible HTML/JS/headers. Never implies a security audit was performed. |
| "AI features" | Not scored. Replaced with "technical modernity signals." |
| "Performance" | PageSpeed data if API key provided; otherwise HTML heuristics. |

---

## ICP (Phase 1)

- Solo founders and small teams (1–10 people) who have shipped something
- Non-technical founders who can't interpret a Lighthouse report
- Agencies wanting a quick scan before a client call

---

## Upgrade Path

The report page surfaces three upgrade packages:

| Package | Pitch | Format |
|---|---|---|
| Deep Audit | Full codebase + architecture review | One-time, scoped engagement |
| Rescue Sprint | Fix top 3–5 critical issues | 2-week, fixed scope, flat rate |
| Monitoring | Weekly automated scans | Recurring subscription |

These CTAs currently point to `/contact?ref=[package]` as placeholders.
