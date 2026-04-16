import { z } from "zod";

export const IssueSchema = z.object({
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  category: z.string(),
  why_it_matters: z.string(),
  evidence: z.string(),
  recommended_fix: z.string(),
  owner: z.enum(["founder", "designer", "developer", "growth"]),
});

export const ReportSchema = z.object({
  executive_summary: z.string().min(1),
  verdict: z.enum(["not_ready", "partially_ready", "ready_with_fixes"]),
  scores: z.object({
    production_readiness: z.number().int().min(0).max(100),
    growth_readiness: z.number().int().min(0).max(100),
    trust_conversion: z.number().int().min(0).max(100),
  }),
  top_issues: z.array(IssueSchema).min(1),
  quick_wins_7_day: z.array(z.string()).min(1),
  roadmap_30_day: z.array(z.string()),
  roadmap_90_day: z.array(z.string()),
  recommended_package: z.object({
    name: z.string(),
    reason: z.string(),
    scope: z.array(z.string()),
  }),
  observed_issues: z.array(z.string()),
  inferred_risks: z.array(z.string()),
  uncertainties: z.array(z.string()),
  next_actions: z.array(z.string()),
});

export type Report = z.infer<typeof ReportSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Verdict = Report["verdict"];
export type Severity = Issue["severity"];
export type IssueOwner = Issue["owner"];
