import "server-only";
import type { Scan, ReportRecord } from "@/lib/schemas/scan";

// In-memory store — used as fallback when Supabase is not configured.
// Data does not persist across server restarts.
const scans = new Map<string, Scan>();
const reports = new Map<string, ReportRecord>();

// ──────────────────────────────────────────────
// Scans
// ──────────────────────────────────────────────

export function localGetScan(id: string): Scan | null {
  return scans.get(id) ?? null;
}

export function localCreateScan(scan: Scan): void {
  scans.set(scan.id, scan);
}

export function localUpdateScan(id: string, updates: Partial<Scan>): void {
  const existing = scans.get(id);
  if (!existing) return;
  scans.set(id, { ...existing, ...updates });
}

export function localListScans(limit = 20): Scan[] {
  return [...scans.values()]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export function localGetReport(id: string): ReportRecord | null {
  return reports.get(id) ?? null;
}

export function localGetReportByScanId(scanId: string): ReportRecord | null {
  for (const report of reports.values()) {
    if (report.scan_id === scanId) return report;
  }
  return null;
}

export function localCreateReport(report: ReportRecord): void {
  reports.set(report.id, report);
}

export function localListReports(limit = 20): ReportRecord[] {
  return [...reports.values()]
    .filter((r) => !r.is_demo)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export function localGetDemoReport(): ReportRecord | null {
  for (const report of reports.values()) {
    if (report.is_demo) return report;
  }
  return null;
}
