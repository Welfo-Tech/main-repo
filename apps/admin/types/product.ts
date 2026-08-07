import type { ProductCategory } from "./product-model";

export type ProductStatus =
  | "UNREGISTERED"
  | "REGISTERED"
  | "IN_SERVICE"
  | "UNDER_REPAIR"
  | "RETIRED"
  | "LOST"
  | "SCRAPPED";

export interface Product {
  id: string;
  serialNumber: string;
  modelId: string | null;
  ownerOrgId: string | null;
  manufactureDate: string | null;
  saleDate: string | null;
  warrantyExpiry: string | null;
  status: ProductStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  model: { id: string; name: string; category: ProductCategory; manufacturer: string } | null;
  ownerOrg: { id: string; name: string } | null;
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  UNREGISTERED: "Unregistered",
  REGISTERED: "Registered",
  IN_SERVICE: "In Service",
  UNDER_REPAIR: "Under Repair",
  RETIRED: "Retired",
  LOST: "Lost",
  SCRAPPED: "Scrapped",
};

export const STATUS_COLORS: Record<ProductStatus, string> = {
  UNREGISTERED: "bg-slate-100 text-slate-600",
  REGISTERED: "bg-blue-50 text-blue-700",
  IN_SERVICE: "bg-teal-50 text-teal-700",
  UNDER_REPAIR: "bg-amber-50 text-amber-700",
  RETIRED: "bg-stone-100 text-stone-600",
  LOST: "bg-red-50 text-red-700",
  SCRAPPED: "bg-red-100 text-red-800",
};
