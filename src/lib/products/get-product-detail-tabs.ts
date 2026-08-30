import type { ProductView } from "@/types/product";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";

export type ProductWorkspaceTabId =
  | "product"
  | "drawing"
  | "details"
  | "technical";

/** @deprecated Use ProductWorkspaceTabId */
export type ProductMediaTabId = "product" | "drawing";

/** @deprecated Use ProductWorkspaceTabId */
export type ProductInfoTabId = "details" | "technical";

const WORKSPACE_TAB_LABELS: Array<{
  id: ProductWorkspaceTabId;
  label: string;
}> = [
  { id: "product", label: "מוצר" },
  { id: "drawing", label: "שרטוט ומידות" },
  { id: "details", label: "פרטי מוצר" },
  { id: "technical", label: "מידע טכני" },
];

export function showProductDrawingTab(product: ProductView): boolean {
  return (
    Boolean(product.technicalDrawing) || hasProductDimensions(product.dimensions)
  );
}

export function showProductTechnicalInfoTab(product: ProductView): boolean {
  return (
    product.materials.length > 0 ||
    product.maintenance.trim().length > 0 ||
    product.warranty.trim().length > 0 ||
    product.countryOfOrigin.trim().length > 0
  );
}

export function showProductDetailsInfoTab(product: ProductView): boolean {
  return product.longDescription.trim().length > 0;
}

export function getProductWorkspaceTabLabels(): Array<{
  id: ProductWorkspaceTabId;
  label: string;
}> {
  return WORKSPACE_TAB_LABELS;
}

/** @deprecated Use getProductWorkspaceTabLabels */
export function getProductMediaTabLabels(
  product: ProductView,
): Array<{ id: ProductMediaTabId; label: string }> {
  const tabs: Array<{ id: ProductMediaTabId; label: string }> = [
    { id: "product", label: "מוצר" },
  ];

  if (showProductDrawingTab(product)) {
    tabs.push({ id: "drawing", label: "שרטוט ומידות" });
  }

  return tabs;
}

/** @deprecated Use getProductWorkspaceTabLabels */
export function getProductInfoTabLabels(product: ProductView): Array<{
  id: ProductInfoTabId;
  label: string;
}> {
  const tabs: Array<{ id: ProductInfoTabId; label: string }> = [];

  if (showProductDetailsInfoTab(product)) {
    tabs.push({ id: "details", label: "פרטי מוצר" });
  }

  if (showProductTechnicalInfoTab(product)) {
    tabs.push({ id: "technical", label: "מידע טכני" });
  }

  return tabs;
}

export function resolveProductWorkspaceTabId(
  requestedTab: string | null,
): ProductWorkspaceTabId {
  const match = WORKSPACE_TAB_LABELS.find((tab) => tab.id === requestedTab);
  return match?.id ?? "product";
}

/** @deprecated Use resolveProductWorkspaceTabId */
export function resolveProductMediaTabId(
  requestedTab: string | null,
  product: ProductView,
): ProductMediaTabId {
  if (requestedTab === "drawing" && showProductDrawingTab(product)) {
    return "drawing";
  }

  if (
    requestedTab === "details" ||
    requestedTab === "technical"
  ) {
    return "product";
  }

  return "product";
}

/** @deprecated Use resolveProductWorkspaceTabId */
export function resolveProductInfoTabId(
  requestedTab: string | null,
  product: ProductView,
): ProductInfoTabId | undefined {
  const tabs = getProductInfoTabLabels(product);
  const match = tabs.find((tab) => tab.id === requestedTab);

  return match?.id ?? tabs[0]?.id;
}

/** @deprecated Lower info section removed — workspace tabs always render */
export function shouldRenderProductInfoSection(product: ProductView): boolean {
  return getProductInfoTabLabels(product).length > 0;
}
