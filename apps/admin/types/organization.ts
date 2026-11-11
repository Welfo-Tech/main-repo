/**
 * Organization-related types shared in the admin app.
 * These types mirror the backend schema exactly for JSON transport.
 */

export enum OrganizationType {
  HOSPITAL = "HOSPITAL",
  CLINIC = "CLINIC",
  DISTRIBUTOR = "DISTRIBUTOR",
  DEALER = "DEALER",
  SERVICE_PARTNER = "SERVICE_PARTNER",
}

export enum OrganizationTier {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export interface Organization {
  /** Unique identifier (UUID or database id as string) */
  id: string;

  /** Display name */
  name: string;

  /** Organization category */
  type: OrganizationType;

  /** Billing / support tier */
  tier: OrganizationTier;

  /** GST number, if applicable */
  gstNumber: string | null;

  /** PAN number, if applicable */
  panNumber: string | null;

  /** Payment terms in days (e.g. 30), or null if not set */
  paymentTermsDays: number | null;

  /** Public website URL, or null */
  website: string | null;

  /** Free-form notes */
  notes: string | null;

  /** Active flag */
  isActive: boolean;

  /** ISO 8601 datetime string when created */
  createdAt: string;

  /** ISO 8601 datetime string when last updated */
  updatedAt: string;

  /** ISO 8601 datetime string when deleted, or null */
  deletedAt: string | null;
}

export default Organization;
