import type { ProductView } from "@/types/product";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import { hasConfiguratorOptions } from "@/lib/products/product-display-helpers";

export type ProductPdpTabId = "overview" | "configure" | "dimensions";

/** @deprecated Use ProductPdpTabId */
export type ProductWorkspaceTabId = ProductPdpTabId;

/** @deprecated Use ProductPdpTabId */
export type ProductMediaTabId = "product" | "drawing";

/** @deprecated Use ProductPdpTabId */
export type ProductInfoTabId = "details" | "technical";

const OVERVIEW_TAB = { id: "overview" as const, label: "סקירה" };
const CONFIGURE_TAB = { id: "configure" as const, label: "הגדרה" };
const DIMENSIONS_TAB = { id: "dimensions" as const, label: "מידות" };

export function showProductConfigureTab(product: ProductView): boolean {
  return hasConfiguratorOptions(product);
}

export function showProductDimensionsTab(product: ProductView): boolean {
  return (
    Boolean(product.technicalDrawing) || hasProductDimensions(product.dimensions)
  );
}

/** @deprecated Use showProductDimensionsTab */
export function showProductDrawingTab(product: ProductView): boolean {
  return showProductDimensionsTab(product);
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

export function getProductPdpTabLabels(product: ProductView): Array<{
  id: ProductPdpTabId;
  label: string;
}> {
  const tabs: Array<{ id: ProductPdpTabId; label: string }> = [OVERVIEW_TAB];

  if (showProductConfigureTab(product)) {
    tabs.push(CONFIGURE_TAB);
  }

  if (showProductDimensionsTab(product)) {
    tabs.push(DIMENSIONS_TAB);
  }

  return tabs;
}

/** @deprecated Use getProductPdpTabLabels */
export function getProductWorkspaceTabLabels(): Array<{
  id: ProductPdpTabId;
  label: string;
}> {
  return [OVERVIEW_TAB, CONFIGURE_TAB, DIMENSIONS_TAB];
}

/** @deprecated Use getProductPdpTabLabels */
export function getProductMediaTabLabels(
  product: ProductView,
): Array<{ id: ProductMediaTabId; label: string }> {
  const tabs: Array<{ id: ProductMediaTabId; label: string }> = [
    { id: "product", label: "מוצר" },
  ];

  if (showProductDimensionsTab(product)) {
    tabs.push({ id: "drawing", label: "שרטוט ומידות" });
  }

  return tabs;
}

/** @deprecated Use getProductPdpTabLabels */
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

function mapLegacyTabId(requestedTab: string): ProductPdpTabId | null {
  switch (requestedTab) {
    case "overview":
      return "overview";
    case "configure":
      return "configure";
    case "dimensions":
      return "dimensions";
    case "product":
    case "details":
    case "technical":
      return "overview";
    case "drawing":
      return "dimensions";
    default:
      return null;
  }
}

export function resolveProductPdpTabId(
  requestedTab: string | null,
  product: ProductView,
): ProductPdpTabId {
  const tabs = getProductPdpTabLabels(product);
  const mapped = requestedTab ? mapLegacyTabId(requestedTab) : null;

  if (mapped && tabs.some((tab) => tab.id === mapped)) {
    return mapped;
  }

  return "overview";
}

/** @deprecated Use resolveProductPdpTabId */
export function resolveProductWorkspaceTabId(
  requestedTab: string | null,
): ProductPdpTabId {
  const mapped = requestedTab ? mapLegacyTabId(requestedTab) : null;
  return mapped ?? "overview";
}

/** @deprecated Use resolveProductPdpTabId */
export function resolveProductMediaTabId(
  requestedTab: string | null,
  product: ProductView,
): ProductMediaTabId {
  if (requestedTab === "drawing" && showProductDimensionsTab(product)) {
    return "drawing";
  }

  return "product";
}

/** @deprecated Use resolveProductPdpTabId */
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
