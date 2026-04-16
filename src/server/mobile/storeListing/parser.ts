/**
 * TODO: Phase 2 — App Store / Play Store Listing Parser
 *
 * DATA ACCESS STRATEGY UNRESOLVED.
 * Do not implement logic until a data access strategy is chosen.
 *
 * Options to evaluate before implementing:
 * 1. AppFollow API — https://appfollow.io
 * 2. AppTweak API  — https://www.apptweak.com
 * 3. SensorTower   — https://sensortower.com
 * 4. data.ai (formerly App Annie)
 * 5. Web scraping  — fragile, likely ToS violation for Apple/Google
 * 6. Manual input  — user pastes listing content into a structured form
 *
 * Choose a strategy, document it in docs/PRD.md, then implement.
 */

// TODO: implement after data access strategy is resolved
export interface AppStoreListing {
  platform: "ios";
  appId: string;
  name: string;
  subtitle: string | null;
  description: string;
  rating: number | null;
  ratingCount: number | null;
  reviewsCount: number | null;
  category: string;
  screenshots: string[]; // URLs
  previewVideoUrl: string | null;
  lastUpdated: string | null;
  version: string | null;
  developer: string;
  developerWebsite: string | null;
  pricingModel: "free" | "paid" | "freemium" | "unknown";
  inAppPurchases: boolean;
  size: string | null;
}

// TODO: implement after data access strategy is resolved
export interface PlayStoreListing {
  platform: "android";
  packageId: string;
  name: string;
  shortDescription: string | null;
  description: string;
  rating: number | null;
  ratingCount: number | null;
  reviewsCount: number | null;
  category: string;
  screenshots: string[]; // URLs
  featureGraphicUrl: string | null;
  lastUpdated: string | null;
  version: string | null;
  developer: string;
  developerWebsite: string | null;
  pricingModel: "free" | "paid" | "freemium" | "unknown";
  inAppPurchases: boolean;
  size: string | null;
  androidVersionRequired: string | null;
}

export type StoreListing = AppStoreListing | PlayStoreListing;
