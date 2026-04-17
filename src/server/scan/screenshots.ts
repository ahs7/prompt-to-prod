import "server-only";

export interface ScreenshotResult {
  url: string | null;
  skipped: boolean;
  reason?: string;
}

async function uploadToSupabaseStorage(
  buffer: Buffer,
  scanId: string
): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET ?? "prompt-to-prod-screenshots";

  if (!supabaseUrl || !serviceRoleKey) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const filePath = `screenshots/${scanId}.png`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("[screenshots] Supabase Storage upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl ?? null;
}

/**
 * Captures a screenshot of the given URL using Playwright.
 * Uploads the image buffer to Supabase Storage — no disk writes.
 * Gracefully skips if Playwright is not installed or Storage is not configured.
 */
export async function captureScreenshot(
  pageUrl: string,
  scanId: string
): Promise<ScreenshotResult> {
  let chromium: typeof import("playwright").chromium | undefined;

  try {
    const playwright = await import("playwright");
    chromium = playwright.chromium;
  } catch {
    return { url: null, skipped: true, reason: "Playwright not installed" };
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { url: null, skipped: true, reason: "Supabase Storage not configured" };
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

    // Capture to buffer — no filesystem write
    const buffer = await page.screenshot({ fullPage: false });

    const publicUrl = await uploadToSupabaseStorage(
      Buffer.from(buffer),
      scanId
    );

    if (!publicUrl) {
      return { url: null, skipped: true, reason: "Storage upload failed" };
    }

    return { url: publicUrl, skipped: false };
  } catch (err) {
    return {
      url: null,
      skipped: true,
      reason: err instanceof Error ? err.message : "Screenshot failed",
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
