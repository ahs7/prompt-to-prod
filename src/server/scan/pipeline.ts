import "server-only";
import { v4 as uuidv4 } from "uuid";
import { normalizeUrl, ScanError } from "./normalizeUrl";
import { dbCreateScan } from "@/server/db/client";
import type { Scan } from "@/lib/schemas/scan";

/**
 * Validates the URL and creates a queued scan record.
 * The actual pipeline runs in two client-triggered steps:
 *   POST /api/scan/[id]/fetch   — HTML extraction (Node.js, <10 s)
 *   POST /api/scan/[id]/analyze — AI report generation (Edge, streaming)
 */
export async function createAndStartScan(rawUrl: string): Promise<string> {
  // Validate before writing to DB so bad URLs fail fast on the POST
  normalizeUrl(rawUrl);

  const scanId = uuidv4();
  const scan: Scan = {
    id: scanId,
    url: rawUrl,
    status: "queued",
    scan_type: "web",
    created_at: new Date().toISOString(),
    completed_at: null,
    crawl_summary: null,
    pagespeed_raw: null,
    screenshot_url: null,
    error_message: null,
  };

  await dbCreateScan(scan);
  return scanId;
}

// Re-export ScanError so api/scan/route.ts doesn't need a second import path
export { ScanError };
