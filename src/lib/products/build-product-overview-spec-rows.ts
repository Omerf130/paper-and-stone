import type { ProductView } from "@/types/product";

export type ProductOverviewSpecRow = {
  label: string;
  value: string;
};

export function buildProductOverviewDescription(product: ProductView): string {
  const longDescription = product.longDescription.trim();
  if (longDescription.length > 0) {
    return longDescription;
  }

  return product.shortDescription.trim();
}

export function buildProductOverviewSpecRows(
  product: ProductView,
): ProductOverviewSpecRow[] {
  const rows: ProductOverviewSpecRow[] = [];

  if (product.category.trim().length > 0) {
    rows.push({ label: "קטגוריה", value: product.category.trim() });
  }

  if (product.brand.trim().length > 0) {
    rows.push({ label: "מותג", value: product.brand.trim() });
  }

  if (product.designer.trim().length > 0) {
    rows.push({ label: "מעצב", value: product.designer.trim() });
  }

  if (product.countryOfOrigin.trim().length > 0) {
    rows.push({ label: "ארץ ייצור", value: product.countryOfOrigin.trim() });
  }

  if (product.materials.length > 0) {
    rows.push({ label: "חומרים", value: product.materials.join(", ") });
  }

  if (product.warranty.trim().length > 0) {
    rows.push({ label: "אחריות", value: product.warranty.trim() });
  }

  if (product.maintenance.trim().length > 0) {
    rows.push({ label: "תחזוקה", value: product.maintenance.trim() });
  }

  if (
    product.name.trim().length > 0 &&
    product.name !== product.nameHe
  ) {
    rows.push({ label: "שם באנגלית", value: product.name.trim() });
  }

  return rows;
}

export function hasProductOverviewContent(product: ProductView): boolean {
  return (
    buildProductOverviewDescription(product).length > 0 ||
    buildProductOverviewSpecRows(product).length > 0
  );
}
