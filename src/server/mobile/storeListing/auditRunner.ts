/**
 * TODO: Phase 2 — Mobile Listing Audit Runner
 *
 * DATA ACCESS STRATEGY UNRESOLVED — do not implement until resolved.
 * See parser.ts for context.
 *
 * When Phase 2 begins:
 * 1. Wire this to mobileStoreAuditPrompt.ts
 * 2. Wire the AI prompt to the extractListingFeatures output
 * 3. Validate output with a MobileListingReportSchema (to be created)
 * 4. Connect to the /api/scan route with scan_type: 'mobile_listing'
 */

import type { StoreListing } from "./parser";

export interface MobileListingAuditResult {
  // TODO: define when Phase 2 begins
  placeholder: true;
}

/**
 * TODO: implement this function when Phase 2 begins.
 * Runs the full mobile listing audit pipeline.
 */
export async function runMobileListingAudit(
  listing: StoreListing
): Promise<MobileListingAuditResult> {
  // TODO: implement
  void listing;
  throw new Error(
    "runMobileListingAudit: Phase 2 not implemented. Resolve data access strategy first."
  );
}
