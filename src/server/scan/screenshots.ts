import "server-only";
import path from "path";

export interface ScreenshotResult {
  url: string | null;
  skipped: boolean;
  reason?: string;
}

/**
 * Attempts to capture a screenshot of the given URL using Playwright.
 * Gracefully skips if Playwright is not installed.
 * Saves to /public/screenshots/[scanId].png or Supabase Storage.
 */
export async function captureScreenshot(
  pageUrl: string,
  scanId: string
): Promise<ScreenshotResult> {
  let chromium: typeof import("playwright").chromium | undefined;

  try {
    // Dynamic import — only succeeds if playwright is installed
    const playwright = await import("playwright");
    chromium = playwright.chromium;
  } catch {
    return {
      url: null,
      skipped: true,
      reason: "Playwright not installed",
    };
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15_000 });

    const screenshotPath = path.join(
      process.cwd(),
      "public",
      "screenshots",
      `${scanId}.png`
    );

    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      url: `${appUrl}/screenshots/${scanId}.png`,
      skipped: false,
    };
  } catch (err) {
    return {
      url: null,
      skipped: true,
      reason: err instanceof Error ? err.message : "Screenshot failed",
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
