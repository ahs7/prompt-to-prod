# Product Roadmap

---

## Phase 1 — Website & Web App Audits (✅ Implemented)

Users submit a public URL. The system evaluates messaging, trust, conversion,
performance, accessibility, SEO, analytics, and monetization readiness from
publicly visible signals.

**Status:** Implemented. See docs/SUMMARY.md for what was built.

---

## Phase 2 — App Store & Play Store Listing Audits (🔧 Scaffolded)

Users submit an App Store or Google Play listing URL. The system evaluates:
- Listing quality (description clarity, keyword density, completeness)
- Screenshot narrative (progression, caption quality, value communication)
- Review signals (rating, count, recency, developer response rate)
- Positioning clarity (category fit, subtitle, first-line hook)
- Monetization clarity (pricing model, IAP, free trial messaging)
- Update frequency (staleness signal)

**Status:** Interface scaffolded in `src/server/mobile/storeListing/`.
Logic not implemented.

**Critical blocker before Phase 2 can begin:**

Apple App Store and Google Play do not provide stable, developer-accessible
public APIs for listing data. Phase 2 requires a resolved data access strategy.

Options to evaluate (in order of preference):

1. **Third-party data providers** — AppFollow, AppTweak, SensorTower, data.ai
   - Provide structured, reliable listing data via API
   - Require paid subscriptions (evaluate cost vs. revenue model)
   - Most reliable path to implementation
   - Action: evaluate pricing and data quality with free trials

2. **Web scraping** — direct scraping of App Store / Play Store pages
   - Fragile (page structure changes frequently)
   - May violate Apple/Google Terms of Service
   - Requires ongoing maintenance
   - Not recommended as primary strategy

3. **Manual input workflow** — user pastes listing content into a structured form
   - Lowest implementation cost
   - Degrades UX (more friction than URL submission)
   - Works as a Phase 2.0 fallback while data access is being resolved
   - Acceptable MVP approach to validate demand before committing to API costs

**Decision required before Phase 2 work begins:**
Choose a data access strategy, document it in `docs/PRD.md`, then implement the
parser and extractor in `src/server/mobile/storeListing/`.

---

## Phase 3 — Deep Mobile Application Audits (📋 Vision Only)

**Status:** Vision documented here. No code scaffolding. Do not implement
until Phase 2 is live and generating revenue that validates continued investment.

Phase 3 is effectively a separate product surface from Phase 1 and 2.

### What Phase 3 Would Cover

**Onboarding Analysis**
- Time-to-value measurement from session recordings
- Drop-off funnel analysis (where users abandon onboarding)
- Clarity of first-session value delivery
- Requires: session recording tool integration (FullStory, PostHog, etc.)

**Retention Signal Audit**
- Day-1, Day-7, Day-30 retention rates
- Re-engagement mechanisms (push, email, in-app)
- Habit formation patterns
- Requires: analytics export (Amplitude, Mixpanel, Firebase, etc.)

**Paywall Effectiveness**
- Conversion rate at paywall touchpoints
- Friction analysis (steps to purchase)
- Value proposition clarity at conversion point
- Requires: revenue analytics (RevenueCat, Stripe, etc.)

**Crash Stability**
- Crash-free session rate
- Crash pattern severity and frequency
- Most impacted OS versions / device types
- Requires: crash reporting integration (Sentry, Crashlytics, etc.)

**Instrumentation Quality**
- Event coverage assessment (are key actions tracked?)
- Funnel completeness
- Data quality and hygiene
- Requires: access to analytics event schema

### Phase 3 Technical Requirements

- APK/IPA static analysis pipeline
- Multiple OAuth integrations (analytics, crash reporting, revenue platforms)
- Session recording analysis (potentially ML-based)
- Secure file upload infrastructure (for APK/IPA submission)
- Potentially: TestFlight / Firebase App Distribution integration

### Phase 3 ICP Expansion

Phase 3 expands the ICP beyond founders to:
- Mobile-first startups post-launch ($10K+ MRR, seeking optimization)
- Growth teams at established mobile apps
- Mobile agencies auditing client apps

### Phase 3 Investment Estimate

Phase 3 requires 3–6 months of development, multiple paid API integrations,
and validated product-market fit from Phase 1 and 2 revenue. It should not
be started until Phase 2 is live and profitable.

---

## What's Not on the Roadmap

The following were explicitly considered and excluded:

- **Builder/fixer functionality:** Prompt-to-Prod is an auditor, not a builder.
  We identify what to fix, not fix it automatically.
- **User accounts in Phase 1:** Adds friction, complexity, and privacy requirements.
  Public reports are intentionally shareable without auth.
- **AI writing assistance:** Out of scope. Founders should write their own copy;
  we tell them what's wrong with it.
- **Competitive analysis:** Requires substantial additional data infrastructure
  and raises different privacy/legal considerations.
