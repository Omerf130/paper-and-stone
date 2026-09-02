import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";
import type { ProductMaterialOptionView } from "@/types/product";
import type { ProductView } from "@/types/product";

type BuildAddToProjectConfigurationViewInput = {
  product: ProductView;
  material: ProductMaterialOptionView | null;
  color: ProductMaterialOptionView["colors"][number] | null;
  sizeLabel: string | null;
  showSize: boolean;
  quantity: number;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
};

export type AddToProjectConfigurationView = {
  productName: string;
  sku: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  rows: Array<{ label: string; value: string }>;
};

export function buildAddToProjectConfigurationView(
  input: BuildAddToProjectConfigurationViewInput,
): AddToProjectConfigurationView {
  const rows = formatProductSelectionSummary({
    material: input.material,
    color: input.color,
    sizeLabel: input.sizeLabel,
    showSize: input.showSize,
    quantity: input.quantity,
  }).filter((row) => row.label !== "כמות");

  return {
    productName: input.product.nameHe,
    sku: input.product.sku,
    thumbnailUrl: input.thumbnailUrl ?? input.product.primaryImage?.url ?? null,
    thumbnailAlt:
      input.thumbnailAlt ??
      input.product.primaryImage?.alt ??
      input.product.nameHe,
    rows,
  };
}
