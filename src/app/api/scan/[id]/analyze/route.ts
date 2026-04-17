import { type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { dbGetScan, dbGetReportByScanId, dbUpdateScan, dbCreateReport } from "@/server/db/client";
import { QUICK_SCAN_SYSTEM_PROMPT, buildQuickScanUserPrompt } from "@/server/ai/prompts/quickScanPrompt";
import { ReportSchema } from "@/lib/schemas/report";
import { demoReport } from "@/server/data/seed/demoReport";
import type { ReportRecord } from "@/lib/schemas/scan";
import type { Report } from "@/lib/schemas/report";

// Edge Runtime: streaming keeps the connection alive for the full AI response
// regardless of how long it takes. No hard wall-clock timeout while bytes are flowing.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const enc = new TextEncoder();

type SSEEvent =
  | { event: "progress"; message: string }
  | { event: "complete"; reportId: string }
  | { event: "error"; message: string }
  | { event: "heartbeat" };

function chunk(payload: SSEEvent): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function buildMockReport(url: string): Report {
  return {
    ...demoReport,
    executive_summary: `This is an estimated report for ${url} — live AI analysis is temporarily unavailable. Run a fresh scan when the service is restored for accurate results.`,
  };
}

async function streamAnthropic(
  systemPrompt: string,
  userContent: string,
  onChunk: (text: string) => void
): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  let full = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      full += event.delta.text;
      onChunk(event.delta.text);
    }
  }
  return full;
}

async function streamOpenAI(
  systemPrompt: string,
  userContent: string,
  onChunk: (text: string) => void
): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    temperature: 0.2,
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  let full = "";
  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content ?? "";
    if (delta) {
      full += delta;
      onChunk(delta);
    }
  }
  return full;
}

function parseReport(raw: string): Report {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return ReportSchema.parse(JSON.parse(cleaned));
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SSEEvent) => controller.enqueue(chunk(payload));

      // Heartbeat every 10 s keeps proxies from closing the connection
      const heartbeat = setInterval(() => send({ event: "heartbeat" }), 10_000);

      try {
        const scan = await dbGetScan(id);
        if (!scan) {
          send({ event: "error", message: "Scan not found." });
          return;
        }

        // Already done — return immediately
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
            message: scan.error_message ?? "Scan failed. Please try again.",
          });
          return;
        }

        const crawlData = scan.crawl_summary as Record<string, unknown> | null;
        if (!crawlData) {
          send({ event: "error", message: "Fetch stage hasn't completed. Please try again." });
          return;
        }

        send({ event: "progress", message: "Generating your report..." });

        const userPrompt = buildQuickScanUserPrompt(
          JSON.stringify(crawlData, null, 2)
        );

        const reportId = uuidv4();
        let report: Report;
        let isMock = false;

        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;

        if (hasAnthropic || hasOpenAI) {
          try {
            // Stream tokens → keeps the Edge connection alive for the full generation
            const streamFn = hasAnthropic ? streamAnthropic : streamOpenAI;
            const rawText = await streamFn(
              QUICK_SCAN_SYSTEM_PROMPT,
              userPrompt,
              () => {
                // Each token resets Vercel's idle-connection timer.
                // We don't forward raw tokens to the client (they're not valid JSON yet).
              }
            );

            try {
              report = parseReport(rawText);
            } catch {
              // Retry once with a correction instruction
              const corrected = await streamFn(
                QUICK_SCAN_SYSTEM_PROMPT,
                userPrompt +
                  "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the raw JSON object — no markdown, no code fences.",
                () => {}
              );
              report = parseReport(corrected);
            }
          } catch (err) {
            console.error("[analyze] AI failed, using mock:", err);
            report = buildMockReport(scan.url);
            isMock = true;
          }
        } else {
          report = buildMockReport(scan.url);
          isMock = true;
        }

        const reportRecord: ReportRecord = {
          id: reportId,
          scan_id: id,
          url: scan.url,
          scan_type: "web",
          report_json: {
            ...(report as unknown as Record<string, unknown>),
            is_mock: isMock,
          },
          verdict: report.verdict,
          score_production: report.scores.production_readiness,
          score_growth: report.scores.growth_readiness,
          score_trust: report.scores.trust_conversion,
          is_demo: false,
          created_at: new Date().toISOString(),
        };

        await Promise.all([
          dbCreateReport(reportRecord),
          dbUpdateScan(id, {
            status: "complete",
            completed_at: new Date().toISOString(),
          }),
        ]);

        send({ event: "complete", reportId });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Analysis failed. Please try again.";
        send({ event: "error", message });
        await dbUpdateScan(id, {
          status: "failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        }).catch(() => {});
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
      "X-Accel-Buffering": "no",
    },
  });
}
