import { type NextRequest } from "next/server";
import { runScanPipeline } from "@/server/scan/pipeline";
import { dbGetScan, dbGetReportByScanId } from "@/server/db/client";
import { ScanError } from "@/server/scan/normalizeUrl";

// Vercel Pro: allow up to 5 minutes. No effect on Hobby (hard 10s limit there).
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type SSEPayload =
  | { event: "progress"; stage: string; message: string; step: number; total: number }
  | { event: "complete"; reportId: string }
  | { event: "error"; message: string }
  | { event: "heartbeat" };

function sseChunk(payload: SSEPayload, encoder: TextEncoder): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SSEPayload) =>
        controller.enqueue(sseChunk(payload, encoder));

      // Heartbeat every 15 s keeps the connection alive through proxies
      const heartbeat = setInterval(
        () => send({ event: "heartbeat" }),
        15_000
      );

      try {
        const scan = await dbGetScan(id);

        if (!scan) {
          send({ event: "error", message: "Scan not found." });
          return;
        }

        // Already finished — return existing result immediately
        if (scan.status === "complete") {
          const report = await dbGetReportByScanId(id);
          send(
            report
              ? { event: "complete", reportId: report.id }
              : { event: "error", message: "Report not found." }
          );
          return;
        }

        if (scan.status === "failed") {
          send({
            event: "error",
            message: scan.error_message ?? "The scan failed. Please try again.",
          });
          return;
        }

        // Run the pipeline — progress events flow back through the SSE stream
        const result = await runScanPipeline(
          scan.url,
          id,
          (stage, message, step, total) =>
            send({ event: "progress", stage, message, step, total })
        );

        send({ event: "complete", reportId: result.reportId });
      } catch (err) {
        const message =
          err instanceof ScanError
            ? err.userMessage
            : err instanceof Error
            ? err.message
            : "Scan failed. Please try again.";
        send({ event: "error", message });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx/proxy response buffering
    },
  });
}
