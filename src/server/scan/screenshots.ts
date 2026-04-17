import "server-only";

export interface ScreenshotResult {
  url: string | null;
  skipped: boolean;
  reason?: string;
}

/**
 * Returns a screenshot URL using an external API — no local browser, no disk writes.
 *
 * Priority:
 * 1. screenshotone.com  — if SCREENSHOT_API_KEY is set (free tier: 100/month)
 * 2. thum.io            — always-free fallback, no key required
 *
 * Both return a URL we store directly in the DB. The browser loads the image
 * lazily when viewing the report — zero scan-time latency.
 */
export async function captureScreenshot(
  pageUrl: string,
  _scanId: string
): Promise<ScreenshotResult> {
  const apiKey = process.env.SCREENSHOT_API_KEY;

  if (apiKey) {
    // screenshotone.com — stable signed URL, no fetch needed at scan time
    const params = new URLSearchParams({
      access_key: apiKey,
      url: pageUrl,
      viewport_width: "1280",
      viewport_height: "900",
      format: "jpg",
      image_quality: "80",
      cache: "true",
      cache_ttl: "2592000", // 30 days
      block_ads: "true",
      block_cookie_banners: "true",
    });
    return {
      url: `https://api.screenshotone.com/take?${params.toString()}`,
      skipped: false,
    };
  }

  // thum.io — completely free, no key, no fetch, no rate limit for reasonable use
  const encoded = encodeURIComponent(pageUrl);
  return {
    url: `https://image.thum.io/get/width/1280/crop/900/${encoded}`,
    skipped: false,
  };
}
