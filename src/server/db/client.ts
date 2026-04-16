import "server-only";
import type { Scan, ReportRecord } from "@/lib/schemas/scan";
import {
  localCreateScan,
  localCreateReport,
  localGetDemoReport,
  localGetReport,
  localGetReportByScanId,
  localGetScan,
  localListReports,
  localListScans,
  localUpdateScan,
} from "./localStore";

function useSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ──────────────────────────────────────────────
// Scans
// ──────────────────────────────────────────────

export async function dbGetScan(id: string): Promise<Scan | null> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("[db] Supabase getScan error, falling back:", error.message);
      return localGetScan(id);
    }
    return data as Scan;
  }
  return localGetScan(id);
}

export async function dbCreateScan(scan: Scan): Promise<void> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("scans").insert(scan);
    if (error) {
      console.error("[db] Supabase createScan error, falling back:", error.message);
      localCreateScan(scan);
    }
    return;
  }
  localCreateScan(scan);
}

export async function dbUpdateScan(
  id: string,
  updates: Partial<Scan>
): Promise<void> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("scans").update(updates).eq("id", id);
    if (error) {
      console.error("[db] Supabase updateScan error, falling back:", error.message);
      localUpdateScan(id, updates);
    }
    return;
  }
  localUpdateScan(id, updates);
}

export async function dbListScans(limit = 20): Promise<Scan[]> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[db] Supabase listScans error, falling back:", error.message);
      return localListScans(limit);
    }
    return (data ?? []) as Scan[];
  }
  return localListScans(limit);
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export async function dbGetReport(id: string): Promise<ReportRecord | null> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("[db] Supabase getReport error, falling back:", error.message);
      return localGetReport(id);
    }
    return data as ReportRecord;
  }
  return localGetReport(id);
}

export async function dbGetReportByScanId(
  scanId: string
): Promise<ReportRecord | null> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("scan_id", scanId)
      .single();
    if (error) {
      return localGetReportByScanId(scanId);
    }
    return data as ReportRecord;
  }
  return localGetReportByScanId(scanId);
}

export async function dbCreateReport(report: ReportRecord): Promise<void> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("reports").insert(report);
    if (error) {
      console.error("[db] Supabase createReport error, falling back:", error.message);
      localCreateReport(report);
    }
    return;
  }
  localCreateReport(report);
}

export async function dbListReports(limit = 20): Promise<ReportRecord[]> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[db] Supabase listReports error, falling back:", error.message);
      return localListReports(limit);
    }
    return (data ?? []) as ReportRecord[];
  }
  return localListReports(limit);
}

export async function dbGetDemoReport(): Promise<ReportRecord | null> {
  if (useSupabase()) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("is_demo", true)
      .single();
    if (error) {
      return localGetDemoReport();
    }
    return data as ReportRecord;
  }
  return localGetDemoReport();
}
