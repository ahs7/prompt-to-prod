import { NextRequest, NextResponse } from "next/server";
import { dbGetScan, dbGetReportByScanId } from "@/server/db/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  const scan = await dbGetScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  const response: {
    scanId: string;
    status: string;
    reportId?: string;
    error?: string;
  } = {
    scanId: scan.id,
    status: scan.status,
  };

  if (scan.status === "complete") {
    const report = await dbGetReportByScanId(id);
    if (report) {
      response.reportId = report.id;
    }
  }

  if (scan.status === "failed") {
    response.error =
      scan.error_message ??
      "The scan failed. Please check the URL and try again.";
  }

  return NextResponse.json(response);
}
