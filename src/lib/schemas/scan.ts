import { z } from "zod";

export const ScanStatusSchema = z.enum([
  "queued",
  "scanning",
  "complete",
  "failed",
]);

export const ScanTypeSchema = z.enum([
  "web",
  "mobile_listing",
  "mobile_deep",
]);

export const CreateScanRequestSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

export const ScanSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  status: ScanStatusSchema,
  scan_type: ScanTypeSchema.default("web"),
  created_at: z.string(),
  completed_at: z.string().nullable().optional(),
  crawl_summary: z.record(z.unknown()).nullable().optional(),
  pagespeed_raw: z.record(z.unknown()).nullable().optional(),
  screenshot_url: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
});

export const ReportRecordSchema = z.object({
  id: z.string().uuid(),
  scan_id: z.string().uuid(),
  url: z.string(),
  scan_type: ScanTypeSchema.default("web"),
  report_json: z.record(z.unknown()),
  verdict: z.string(),
  score_production: z.number().int().nullable().optional(),
  score_growth: z.number().int().nullable().optional(),
  score_trust: z.number().int().nullable().optional(),
  is_demo: z.boolean().default(false),
  created_at: z.string(),
});

export const ScanStatusResponseSchema = z.object({
  scanId: z.string(),
  status: ScanStatusSchema,
  reportId: z.string().optional(),
  error: z.string().optional(),
});

export type Scan = z.infer<typeof ScanSchema>;
export type ReportRecord = z.infer<typeof ReportRecordSchema>;
export type ScanStatus = z.infer<typeof ScanStatusSchema>;
export type ScanType = z.infer<typeof ScanTypeSchema>;
export type ScanStatusResponse = z.infer<typeof ScanStatusResponseSchema>;
