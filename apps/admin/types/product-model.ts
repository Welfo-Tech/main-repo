export type ProductCategory = "ENDOSCOPE" | "FIBER_OPTIC" | "IMAGING_DEVICE" | "OTHER";

export interface ProductModel {
  id: string;
  name: string;
  category: ProductCategory;
  manufacturer: string;
  description: string | null;
  specifications: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ENDOSCOPE: "Endoscope",
  FIBER_OPTIC: "Fiber Optic",
  IMAGING_DEVICE: "Imaging Device",
  OTHER: "Other",
};
