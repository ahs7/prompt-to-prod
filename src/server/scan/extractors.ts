import "server-only";
import * as cheerio from "cheerio";

export interface ExtractedPageData {
  url: string;
  title: string | null;
  metaDescription: string | null;
  headings: { level: number; text: string }[];
  ctaTexts: string[];
  forms: {
    count: number;
    fieldTypes: string[];
    labels: string[];
    submitTexts: string[];
  };
  trustSignals: string[];
  contactSignals: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasAddress: boolean;
  };
  pricingSignals: string[];
  analyticsHints: string[];
  socialLinks: string[];
  stackHints: string[];
  wordCount: number;
  internalLinks: string[];
  hasViewportMeta: boolean;
  hasLangAttribute: boolean;
  hasOpenGraph: boolean;
  hasStructuredData: boolean;
  imagesWithoutAlt: number;
  totalImages: number;
  renderBlockingScripts: number;
  inlineStyleCharCount: number;
  hasMixedContent: boolean;
  formLabelsCount: number;
}

const ANALYTICS_PATTERNS: Record<string, RegExp> = {
  GA4: /google[^\s]*analytics|gtag|googletagmanager/i,
  GTM: /googletagmanager\.com/i,
  MetaPixel: /connect\.facebook\.net|fbevents/i,
  Hotjar: /hotjar\.com|hjid/i,
  Segment: /cdn\.segment\.com|segment\.io/i,
  Mixpanel: /cdn\.mxpnl\.com|mixpanel/i,
  Amplitude: /cdn\.amplitude\.com|amplitude\.com/i,
  PostHog: /posthog\.com|app\.posthog/i,
};

const TRUST_KEYWORDS =
  /testimonial|review|star|rating|guarantee|certified|award|trusted|verified|secure|ssl|official|accredited|iso|gdpr|soc2|pci/i;

const PRICING_KEYWORDS =
  /pricing|plans|per month|\/mo|per year|\/yr|free trial|free plan|monthly|annually|subscribe|upgrade/i;

const SOCIAL_DOMAINS = [
  "twitter.com",
  "x.com",
  "linkedin.com",
  "github.com",
  "producthunt.com",
  "instagram.com",
  "facebook.com",
  "youtube.com",
];

const FRAMEWORK_SIGNATURES: Record<string, RegExp> = {
  Next: /\/_next\//,
  Nuxt: /\/_nuxt\//,
  Gatsby: /\/static\/gatsby/,
  WordPress: /wp-content|wp-includes/,
  Webflow: /webflow\.com/,
  Framer: /framer\.com|framerusercontent/,
  Ghost: /ghost\.io|content\.ghost/,
};

function extractAnalytics(html: string, $: ReturnType<typeof cheerio.load>): string[] {
  const found: string[] = [];
  const scriptSrcs: string[] = [];
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src") ?? "";
    scriptSrcs.push(src);
  });
  const fullContent = html + scriptSrcs.join(" ");
  for (const [name, pattern] of Object.entries(ANALYTICS_PATTERNS)) {
    if (pattern.test(fullContent)) {
      found.push(name);
    }
  }
  return found;
}

function extractStackHints(html: string, $: ReturnType<typeof cheerio.load>): string[] {
  const hints: string[] = [];
  const generator = $('meta[name="generator"]').attr("content");
  if (generator) hints.push(`Generator: ${generator}`);

  const allScriptSrcs = $("script[src]")
    .map((_, el) => $(el).attr("src") ?? "")
    .get()
    .join(" ");
  const allLinkHrefs = $("link[href]")
    .map((_, el) => $(el).attr("href") ?? "")
    .get()
    .join(" ");
  const fullContent = allScriptSrcs + " " + allLinkHrefs + " " + html;

  for (const [name, pattern] of Object.entries(FRAMEWORK_SIGNATURES)) {
    if (pattern.test(fullContent)) {
      hints.push(name);
    }
  }
  return hints;
}

function extractVisibleBodyText($: ReturnType<typeof cheerio.load>): string {
  const clone = $("body").clone();
  clone.find("nav, footer, header, script, style, noscript").remove();
  return clone.text().replace(/\s+/g, " ").trim();
}

/**
 * Extracts all meaningful signals from an HTML page.
 */
export function extractPageData(html: string, url: string): ExtractedPageData {
  const $ = cheerio.load(html);

  // Title and meta
  const title = $("title").text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;

  // Headings h1–h3
  const headings: { level: number; text: string }[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      const tag = el.type === "tag" ? el.name : "h1";
      const level = parseInt(tag.replace("h", ""), 10);
      headings.push({ level, text });
    }
  });

  // CTA texts: buttons + anchor tags with button-like classes/roles
  const ctaTexts: string[] = [];
  $("button, [role='button'], input[type='submit']").each((_, el) => {
    const text = $(el).text().trim() || $(el).attr("value") || "";
    if (text) ctaTexts.push(text);
  });
  $("a").each((_, el) => {
    const cls = $(el).attr("class") ?? "";
    const role = $(el).attr("role") ?? "";
    if (/btn|button|cta/i.test(cls) || role === "button") {
      const text = $(el).text().trim();
      if (text) ctaTexts.push(text);
    }
  });

  // Forms
  const forms = $("form");
  const fieldTypes: string[] = [];
  const labels: string[] = [];
  const submitTexts: string[] = [];
  let formLabelsCount = 0;

  forms.each((_, form) => {
    $(form)
      .find("input, select, textarea")
      .each((_, field) => {
        const type = $(field).attr("type") ?? "text";
        fieldTypes.push(type);
      });
    $(form)
      .find("label")
      .each((_, label) => {
        const text = $(label).text().trim();
        if (text) {
          labels.push(text);
          formLabelsCount++;
        }
      });
    $(form)
      .find("button[type='submit'], input[type='submit']")
      .each((_, btn) => {
        const text = $(btn).text().trim() || $(btn).attr("value") || "";
        if (text) submitTexts.push(text);
      });
  });

  // Trust signals
  const trustSignals: string[] = [];
  const bodyText = extractVisibleBodyText($);
  const trustMatches = bodyText.match(
    /testimonial|review|star|rating|\d+\s*reviews|\d+\s*customers|guarantee|certified|award|trusted|verified|secure|ssl|official|accredited|iso|gdpr|soc2|pci/gi
  );
  if (trustMatches) trustSignals.push(...[...new Set(trustMatches)]);

  // Contact signals
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex =
    /(\+?\d[\d\s\-().]{7,}\d)/;
  const addressKeywords = /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr)/i;
  const hasEmail = emailRegex.test(html);
  const hasPhone = phoneRegex.test(html);
  const hasAddress = addressKeywords.test(html);

  // Pricing signals
  const pricingSignals: string[] = [];
  const pricingMatches = bodyText.match(
    /\$[\d,.]+|€[\d,.]+|£[\d,.]+|pricing|plans|per month|\/mo|free trial|free plan|upgrade/gi
  );
  if (pricingMatches) pricingSignals.push(...[...new Set(pricingMatches)].slice(0, 10));

  // Analytics
  const analyticsHints = extractAnalytics(html, $);

  // Social links
  const socialLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (SOCIAL_DOMAINS.some((domain) => href.includes(domain))) {
      socialLinks.push(href);
    }
  });

  // Stack hints
  const stackHints = extractStackHints(html, $);

  // Word count (visible body text)
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // Internal links (same domain)
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch {}
  const internalLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    try {
      const parsed = new URL(href, url);
      if (parsedUrl && parsed.hostname === parsedUrl.hostname) {
        internalLinks.push(parsed.pathname);
      }
    } catch {}
  });

  // Performance signals
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const hasLangAttribute = !!$("html").attr("lang");
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;
  const hasStructuredData =
    $('script[type="application/ld+json"]').length > 0 ||
    $("[itemscope]").length > 0;

  // Images without alt
  const allImages = $("img");
  const imagesWithoutAlt = allImages.filter((_, el) => !$(el).attr("alt")).length;
  const totalImages = allImages.length;

  // Render-blocking scripts in <head>
  let renderBlockingScripts = 0;
  $("head script[src]").each((_, el) => {
    const defer = $(el).attr("defer");
    const async_ = $(el).attr("async");
    if (defer === undefined && async_ === undefined) {
      renderBlockingScripts++;
    }
  });

  // Inline style character count
  let inlineStyleCharCount = 0;
  $("style").each((_, el) => {
    inlineStyleCharCount += $(el).text().length;
  });

  // Mixed content
  const hasMixedContent =
    url.startsWith("https://") &&
    (html.includes("http://") &&
      /http:\/\/[^"'\s>]+\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)/i.test(
        html
      ));

  return {
    url,
    title,
    metaDescription,
    headings,
    ctaTexts,
    forms: {
      count: forms.length,
      fieldTypes,
      labels,
      submitTexts,
    },
    trustSignals,
    contactSignals: { hasEmail, hasPhone, hasAddress },
    pricingSignals,
    analyticsHints,
    socialLinks: [...new Set(socialLinks)],
    stackHints,
    wordCount,
    internalLinks: [...new Set(internalLinks)].slice(0, 50),
    hasViewportMeta,
    hasLangAttribute,
    hasOpenGraph,
    hasStructuredData,
    imagesWithoutAlt,
    totalImages,
    renderBlockingScripts,
    inlineStyleCharCount,
    hasMixedContent,
    formLabelsCount,
  };
}
