import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAndStartScan } from "@/server/scan/pipeline";
import { checkRateLimit } from "@/lib/rateLimit";
import { ScanError } from "@/server/scan/normalizeUrl";

const RequestSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error:
          "You've run too many scans recently. Please wait an hour before scanning again.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { url } = parsed.data;

  try {
    const scanId = await createAndStartScan(url);
    return NextResponse.json({ scanId, status: "queued" }, { status: 202 });
  } catch (err) {
    if (err instanceof ScanError) {
      return NextResponse.json({ error: err.userMessage }, { status: 400 });
    }
    console.error("[api/scan] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong starting the scan. Please try again." },
      { status: 500 }
    );
  }
}
