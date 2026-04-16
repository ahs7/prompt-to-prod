/**
 * TODO: Phase 2 — Store Listing Feature Extractor
 *
 * DATA ACCESS STRATEGY UNRESOLVED — do not implement until resolved.
 * See parser.ts for data access options to evaluate.
 */

import type { StoreListing } from "./parser";

// TODO: implement after data access resolved
export interface ListingFeatures {
  hasSubtitle: boolean;
  descriptionWordCount: number;
  screenshotCount: number;
  hasPreviewVideo: boolean;
  rating: number | null;
  ratingCount: number | null;
  hasRecentUpdate: boolean; // updated within 90 days
  keywordDensity: Record<string, number>;
  hasPrivacyLink: boolean;
  hasDeveloperWebsite: boolean;
  pricingClarity: "clear" | "unclear" | "unknown";
  monetizationModel: string;
}

/**
 * TODO: implement this function after data access is resolved.
 * Extracts structured features from a store listing for audit scoring.
 */
export function extractListingFeatures(
  listing: StoreListing
): ListingFeatures {
  // TODO: implement
  void listing;
  throw new Error(
    "extractListingFeatures: Phase 2 not implemented. Resolve data access strategy first."
  );
}
