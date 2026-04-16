# Assumptions

This document records major assumptions made during Phase 1 implementation.

---

## Architecture

**A1: Server-side AI only**
All AI prompt logic is gated behind `import "server-only"` and never runs in the browser.
This prevents API key leakage and keeps prompt engineering centralized.

**A2: No authentication in Phase 1**
Reports and scans are publicly readable by anyone with the URL.
This is intentional for the MVP — simplicity maximizes shareability.
Authentication can be added in a later phase with Supabase Auth.

**A3: Background pipeline, not streaming**
The scan pipeline runs as a background process after the API responds with a `scanId`.
The frontend polls `/api/scan/[id]` every 3 seconds.
This avoids serverless function timeout limits on Vercel (max 60s on hobby tier).

**A4: Local JSON fallback is the default for zero-config demos**
If `SUPABASE_URL` is not set, all data is persisted to `.local-data/*.json` files.
This means the app fully runs without any external services — critical for demos.
The local store is not suitable for production (no concurrency control).

---

## Scan Behavior

**A5: HTTPS assumed if no scheme provided**
If a user enters `mysite.com`, we add `https://` before attempting fetch.
HTTP URLs are allowed but users rarely type them explicitly.

**A6: 5-page crawl limit**
We only crawl a fixed list of high-value pages (`/pricing`, `/features`, `/about`, `/contact`, `/signup`, `/register`).
This keeps scan time predictable and avoids accidentally spidering large sites.

**A7: 10-second total crawl timeout**
The 10-second cap ensures scans complete in a reasonable time even if some pages are slow.
Pages that don't respond in time are marked as `timeout`, not errors.

**A8: Screenshot is optional infrastructure**
Playwright is not in `package.json` as a required dependency — it's dynamically imported.
If not installed, screenshots are silently skipped. The report is fully usable without them.

**A9: PageSpeed API is optional**
If `PAGESPEED_API_KEY` is not set, heuristic signals derived from HTML analysis are used instead.
The UI does not surface which method was used — performance is rated either way.

---

## AI and Scoring

**A10: Heuristic scores are AI inputs, not final scores**
The `computeHeuristics()` function produces signal values that are passed to the AI as context.
The AI determines final scores. Heuristics prevent the AI from hallucinating scores
with no grounding in observed data.

**A11: AI score realism constraint**
The prompt explicitly instructs the AI to reserve 80+ scores for genuinely strong signals.
This prevents the common LLM tendency to be overly positive and inflate scores.

**A12: Mock report on AI failure**
If no AI provider is configured, or if the AI produces invalid JSON twice in a row,
a mock report based on the demo report structure is returned.
The report page shows a yellow "estimated report" banner in this case.
The app never crashes due to AI unavailability.

**A13: AI provider priority**
Anthropic (claude-sonnet-4-6) is tried first, then OpenAI (gpt-4o).
This order can be changed by adjusting `provider.ts` — no user-facing impact.

---

## Scope Boundaries

**A14: No security audit**
The scan observes only publicly visible HTML/JS/headers.
The report never claims to have performed a security audit.
Security observations are limited to: HTTPS usage, mixed content detection,
visible credential patterns in public JS (not implemented in Phase 1 — too risky for false positives).

**A15: Login-gated content is an uncertainty, not a failure**
If the product requires login, auth-gated features are added to `uncertainties[]`,
not scored as poor. This is honest — we can't evaluate what we can't see.

**A16: "Retention" is signals only**
Retention is assessed by visible surface signals only (copy, email capture, notification presence).
The report uses "retention signals" language, not "retention audit."

**A17: AI opportunity layer removed**
Per the product spec, the "AI opportunity layer" dimension has been removed from scoring.
It was replaced with "technical modernity signals" which can be reliably detected from HTML.

---

## Phase 2/3 Boundaries

**A18: Phase 2 data access is unresolved**
App Store and Google Play do not provide stable public APIs.
Phase 2 scaffolding exists as typed interfaces with TODO markers.
No Phase 2 logic has been implemented. The data access question must be resolved before proceeding.

**A19: Phase 3 is docs-only**
Phase 3 (deep mobile audits) is documented in `docs/roadmap.md` only.
No code scaffolding was created for Phase 3 to avoid premature abstraction
before the implementation approach is validated.

---

## UI/UX

**A20: Dark mode only in Phase 1**
Light mode is not implemented. The design is dark-first throughout.
Light mode can be added via a ThemeProvider in Phase 2 if needed.

**A21: No real-time WebSocket updates**
Scan progress is communicated via polling (3-second interval).
WebSocket or SSE streaming was considered but deferred — polling is simpler to deploy.

**A22: Report URLs are stable and shareable**
Report IDs are UUIDs. `/report/[uuid]` is a stable, shareable URL.
Reports are not time-limited in Phase 1.

---

## Rate Limiting

**A23: In-memory rate limiting**
The current rate limiter uses a server-side `Map`. This resets on server restart
and doesn't work correctly with multiple server instances.
The interface is designed for easy Redis replacement when needed.
Default: 5 scans per IP per hour.
