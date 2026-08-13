import type { IProject, IProjectItem } from "@/models/Project";
import { formatProjectItemSummary } from "@/lib/projects/project-display-helpers";

export type BuiltQuoteItemLine = {
  projectItemId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot?: string;
  configurationSummary: string;
  quantity: number;
};

export function buildConfigurationSummary(item: IProjectItem): string {
  const material = item.snapshot.materialName;
  const color = item.snapshot.colorName;
  const size = item.snapshot.sizeLabel;
  const parts = [material, color, size].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : item.snapshot.productName;
}

export function buildQuoteItemLinesFromProject(
  project: Pick<IProject, "items">,
): BuiltQuoteItemLine[] {
  return project.items.map((item) => ({
    projectItemId: item._id.toString(),
    productId: item.productId.toString(),
    productNameSnapshot: item.snapshot.productName,
    skuSnapshot: item.snapshot.sku,
    configurationSummary: buildConfigurationSummary(item),
    quantity: item.quantity,
  }));
}

export function buildQuoteItemLineSummary(item: IProjectItem): string {
  return formatProjectItemSummary({
    snapshot: item.snapshot,
    quantity: item.quantity,
  });
}

export function assertProjectItemsMatchQuoteInput(
  project: Pick<IProject, "items">,
  inputItemIds: string[],
): void {
  const projectItemIds = project.items.map((item) => item._id.toString()).sort();
  const sortedInputIds = [...inputItemIds].sort();

  if (
    projectItemIds.length !== sortedInputIds.length ||
    projectItemIds.some((id, index) => id !== sortedInputIds[index])
  ) {
    throw new Error("ITEMS_MISMATCH");
  }
}
