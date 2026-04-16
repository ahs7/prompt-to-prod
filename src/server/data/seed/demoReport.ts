import "server-only";
import type { Report } from "@/lib/schemas/report";
import type { ReportRecord, Scan } from "@/lib/schemas/scan";

export const DEMO_SCAN_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_REPORT_ID = "00000000-0000-0000-0000-000000000002";
export const DEMO_URL = "https://demo.example.com";

export const demoReport: Report = {
  executive_summary:
    "demo.example.com has the bones of a real product but is leaking conversions at every step. There's no pricing transparency, no social proof above the fold, and the primary CTA is buried. Visitors can't quickly understand what they're signing up for or why they should trust you. These are fixable issues, but they're costing you signups today.",
  verdict: "partially_ready",
  scores: {
    production_readiness: 52,
    growth_readiness: 41,
    trust_conversion: 38,
  },
  top_issues: [
    {
      title: "No pricing page — visitors can't self-qualify",
      severity: "critical",
      category: "Conversion",
      why_it_matters:
        "When price is hidden, buyers assume it's expensive. B2B SaaS that hides pricing sees up to 30% higher bounce rates on the pricing decision. You're filtering out good-fit customers before they ever contact you.",
      evidence:
        "Crawl found no /pricing page (404). No pricing language detected on homepage. No currency symbols or plan language in visible body copy.",
      recommended_fix:
        "Add a /pricing page with at least 2-3 tiers. If you're afraid to show price, start with 'Starting from $X/month' — anything is better than nothing.",
      owner: "founder",
    },
    {
      title: "Hero headline is product-centric, not outcome-centric",
      severity: "high",
      category: "Messaging",
      why_it_matters:
        "Founders describe features; buyers buy outcomes. A headline like 'The all-in-one platform for X' tells visitors nothing about their life after using you. This directly reduces trial signups by increasing cognitive effort.",
      evidence:
        "H1 reads: 'The most powerful X platform'. No outcome language detected in above-fold copy. No 'so you can', 'without', or 'so that' language patterns in first 200 words.",
      recommended_fix:
        "Rewrite your headline using the formula: [Who you help] + [achieve outcome] + [without pain point]. Test it with 5 potential customers before shipping.",
      owner: "founder",
    },
    {
      title: "No testimonials or social proof above the fold",
      severity: "high",
      category: "Trust",
      why_it_matters:
        "First-time visitors have no reason to trust you. Social proof cuts the 'is this legit?' question in half. Without it, you're asking visitors to take a leap of faith. For early-stage products, even 2-3 real quotes convert significantly better than none.",
      evidence:
        "No testimonial keywords detected in visible body text. No star rating patterns. No customer logo section found. No review count patterns detected on homepage.",
      recommended_fix:
        "Add 2-3 short customer quotes directly below the hero. Even Twitter DMs or Slack screenshots work at this stage. Customer logos (even free-tier users) add instant credibility.",
      owner: "designer",
    },
    {
      title: "Primary CTA is below the fold — users leave before seeing it",
      severity: "high",
      category: "Conversion",
      why_it_matters:
        "On mobile, 57% of users never scroll past the first screen. If your main signup CTA isn't visible immediately, mobile visitors who would convert are leaving without acting. Every pixel of CTA displacement costs you signups.",
      evidence:
        "Only 1 CTA detected in visible HTML. CTA text: 'Get started'. Position inferred from DOM order — appears after 3 section blocks. No sticky navigation with CTA detected.",
      recommended_fix:
        "Move your primary CTA into the hero section. Add a secondary CTA in the sticky header. Both should be visible on mobile without scrolling.",
      owner: "designer",
    },
    {
      title: "No analytics tracking — you're flying blind",
      severity: "medium",
      category: "Analytics",
      why_it_matters:
        "Without analytics, you cannot know which pages visitors drop off, which CTAs get clicked, or whether your fixes are working. You'll keep making product decisions based on gut feeling instead of data.",
      evidence:
        "No analytics script detected. No GA4, GTM, Meta Pixel, Hotjar, Segment, Mixpanel, Amplitude, or PostHog signatures found in page source.",
      recommended_fix:
        "Install PostHog (free, open source, self-hostable) or Google Analytics 4 this week. It takes 15 minutes and immediately gives you session data. Set up a single conversion event for your primary CTA click.",
      owner: "developer",
    },
    {
      title: "Missing Open Graph tags — links look broken when shared",
      severity: "medium",
      category: "SEO / Distribution",
      why_it_matters:
        "When someone shares your link on Twitter, LinkedIn, or Slack, no OG tags means your link shows as a plain URL with no image, title, or description. This dramatically reduces click-through rates on shared links. For early-stage products, word-of-mouth is your primary channel — don't break it.",
      evidence:
        "No og:title, og:description, or og:image meta tags found in page <head>. Sharing this URL on social media will render as a bare link.",
      recommended_fix:
        "Add og:title, og:description, og:image, and og:url to your <head>. Use a 1200×630px image. Most frameworks have a plugin or built-in solution for this.",
      owner: "developer",
    },
  ],
  quick_wins_7_day: [
    "Add og:title, og:description, and og:image tags (30 minutes, developer task)",
    "Install PostHog or GA4 — pick one, configure one conversion event",
    "Move your primary CTA button into the hero section above the fold",
    "Add 2-3 real customer quotes anywhere on the homepage",
    "Write a /pricing page with at least one pricing tier — even 'Contact for pricing' is better than nothing",
  ],
  roadmap_30_day: [
    "Rewrite hero headline to focus on customer outcome, not product feature",
    "Build a proper social proof section: logos, quotes, review counts",
    "Add a sticky navigation bar with CTA visible on scroll",
    "Set up a proper analytics funnel from landing → CTA → signup → first action",
    "Add structured data (JSON-LD) for better search appearance",
    "Create a /features page with clear capability descriptions",
  ],
  roadmap_90_day: [
    "A/B test 3 headline variants using analytics data",
    "Implement live chat or chat widget for conversion assistance",
    "Build case studies or success stories section",
    "Add schema.org SoftwareApplication markup for rich search results",
    "Create a resource or blog section to build organic traffic",
    "Set up automated email nurture sequence for free trial signups",
    "Implement session recording (Hotjar or PostHog) to watch real user behavior",
  ],
  recommended_package: {
    name: "Rescue Sprint",
    reason:
      "Your top 5 issues are well-defined and fixable in 2 weeks. You don't need discovery — you need execution. A rescue sprint will directly address your conversion and trust gaps, giving you a measurable lift in signups within 30 days.",
    scope: [
      "Hero section rewrite and above-fold CTA repositioning",
      "Pricing page creation with 2-3 tier structure",
      "Social proof section with testimonials and trust signals",
      "Analytics setup with conversion tracking",
      "Technical SEO fixes: OG tags, structured data, meta descriptions",
    ],
  },
  observed_issues: [
    "No /pricing page found (404)",
    "No analytics tracking scripts detected",
    "No Open Graph meta tags in <head>",
    "Only 1 CTA element detected in page HTML",
    "No testimonial or review language in visible body text",
    "Hero H1 lacks outcome-focused language",
    "No /contact page found (404)",
  ],
  inferred_risks: [
    "High bounce rate likely due to no pricing clarity — visitors assume price is too high",
    "Organic traffic probably converting poorly due to missing SEO basics",
    "Mobile conversion likely lower than desktop due to CTA placement",
    "Without analytics, no way to validate whether fixes are working",
    "Social sharing of your URL likely has poor click-through rates",
  ],
  uncertainties: [
    "This scan could only assess what is publicly visible. If key features require login, they were not evaluated.",
    "Actual page load performance was estimated from HTML structure — a PageSpeed API key would provide accurate scores.",
    "Onboarding flow quality could not be assessed — requires a logged-in user session.",
    "Retention mechanisms (email sequences, in-app notifications) could not be evaluated from public pages.",
    "Backend reliability, uptime, and error handling were not tested.",
    "Competitor positioning was not evaluated — requires market context the scan cannot provide.",
  ],
  next_actions: [
    "Install analytics tracking today — you need data before making any other decisions",
    "Move your CTA above the fold — single highest-leverage change for signups",
    "Create a /pricing page this week — even rough pricing builds trust",
    "Add 2-3 customer quotes to the homepage",
    "Add Open Graph tags for better social sharing",
    "Schedule a 30-day check-in to review analytics data and validate fixes",
  ],
};

export const demoScan: Scan = {
  id: DEMO_SCAN_ID,
  url: DEMO_URL,
  status: "complete",
  scan_type: "web",
  created_at: new Date(Date.now() - 86400000).toISOString(),
  completed_at: new Date(Date.now() - 86350000).toISOString(),
  crawl_summary: null,
  pagespeed_raw: null,
  screenshot_url: null,
  error_message: null,
};

export const demoReportRecord: ReportRecord = {
  id: DEMO_REPORT_ID,
  scan_id: DEMO_SCAN_ID,
  url: DEMO_URL,
  scan_type: "web",
  report_json: demoReport as unknown as Record<string, unknown>,
  verdict: demoReport.verdict,
  score_production: demoReport.scores.production_readiness,
  score_growth: demoReport.scores.growth_readiness,
  score_trust: demoReport.scores.trust_conversion,
  is_demo: true,
  created_at: new Date(Date.now() - 86350000).toISOString(),
};
