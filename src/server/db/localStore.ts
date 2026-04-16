import "server-only";
import fs from "fs";
import path from "path";
import type { Scan, ReportRecord } from "@/lib/schemas/scan";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const SCANS_FILE = path.join(DATA_DIR, "scans.json");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeJSON<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ──────────────────────────────────────────────
// Scans
// ──────────────────────────────────────────────

export function localGetScan(id: string): Scan | null {
  const scans = readJSON<Scan>(SCANS_FILE);
  return scans.find((s) => s.id === id) ?? null;
}

export function localCreateScan(scan: Scan): void {
  const scans = readJSON<Scan>(SCANS_FILE);
  scans.push(scan);
  writeJSON(SCANS_FILE, scans);
}

export function localUpdateScan(id: string, updates: Partial<Scan>): void {
  const scans = readJSON<Scan>(SCANS_FILE);
  const idx = scans.findIndex((s) => s.id === id);
  if (idx === -1) return;
  scans[idx] = { ...scans[idx], ...updates };
  writeJSON(SCANS_FILE, scans);
}

export function localListScans(limit = 20): Scan[] {
  const scans = readJSON<Scan>(SCANS_FILE);
  return scans.slice(-limit).reverse();
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export function localGetReport(id: string): ReportRecord | null {
  const reports = readJSON<ReportRecord>(REPORTS_FILE);
  return reports.find((r) => r.id === id) ?? null;
}

export function localGetReportByScanId(scanId: string): ReportRecord | null {
  const reports = readJSON<ReportRecord>(REPORTS_FILE);
  return reports.find((r) => r.scan_id === scanId) ?? null;
}

export function localCreateReport(report: ReportRecord): void {
  const reports = readJSON<ReportRecord>(REPORTS_FILE);
  reports.push(report);
  writeJSON(REPORTS_FILE, reports);
}

export function localListReports(limit = 20): ReportRecord[] {
  const reports = readJSON<ReportRecord>(REPORTS_FILE);
  return reports.filter((r) => !r.is_demo).slice(-limit).reverse();
}

export function localGetDemoReport(): ReportRecord | null {
  const reports = readJSON<ReportRecord>(REPORTS_FILE);
  return reports.find((r) => r.is_demo) ?? null;
}
