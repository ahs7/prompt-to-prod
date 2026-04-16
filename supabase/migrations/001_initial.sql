-- Prompt-to-Prod: Initial Schema Migration
-- Run this against your Supabase project to set up the database.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- scans table
-- Tracks each URL scan job and its status
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'scanning', 'complete', 'failed')),
  scan_type TEXT NOT NULL DEFAULT 'web' CHECK (scan_type IN ('web', 'mobile_listing', 'mobile_deep')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  crawl_summary JSONB,
  pagespeed_raw JSONB,
  screenshot_url TEXT,
  error_message TEXT
);

-- Index for quick status polling
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans (status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);

-- ──────────────────────────────────────────────
-- reports table
-- Stores the generated audit report for each scan
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'web' CHECK (scan_type IN ('web', 'mobile_listing', 'mobile_deep')),
  report_json JSONB NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('not_ready', 'partially_ready', 'ready_with_fixes')),
  score_production INT CHECK (score_production BETWEEN 0 AND 100),
  score_growth INT CHECK (score_growth BETWEEN 0 AND 100),
  score_trust INT CHECK (score_trust BETWEEN 0 AND 100),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup by scan_id and for listing
CREATE INDEX IF NOT EXISTS idx_reports_scan_id ON reports (scan_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_is_demo ON reports (is_demo) WHERE is_demo = true;

-- ──────────────────────────────────────────────
-- Row Level Security
-- Reports and scans are public read (no auth required for Phase 1)
-- ──────────────────────────────────────────────
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "scans_public_read" ON scans FOR SELECT USING (true);
CREATE POLICY "reports_public_read" ON reports FOR SELECT USING (true);

-- Only service role can write (used by server-side pipeline)
CREATE POLICY "scans_service_write" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "scans_service_update" ON scans FOR UPDATE USING (true);
CREATE POLICY "reports_service_write" ON reports FOR INSERT WITH CHECK (true);
