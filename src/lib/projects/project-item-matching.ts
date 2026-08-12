import { Types } from "mongoose";
import type { IProjectItem } from "@/models/Project";

export type ProjectItemSelectionKey = {
  productId: Types.ObjectId;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
};

export function normalizeOptionalId(value: string | undefined): string | null {
  return value?.trim() ? value.trim() : null;
}

export function buildProjectItemSelectionKey(
  productId: Types.ObjectId,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): ProjectItemSelectionKey {
  return {
    productId,
    selectedMaterialId: normalizeOptionalId(selectedMaterialId),
    selectedColorId: normalizeOptionalId(selectedColorId),
    selectedSizeKey: normalizeOptionalId(selectedSizeKey),
  };
}

export function projectItemsMatchSelection(
  item: Pick<
    IProjectItem,
    | "productId"
    | "selectedMaterialId"
    | "selectedColorId"
    | "selectedSizeKey"
  >,
  selection: ProjectItemSelectionKey,
): boolean {
  return (
    item.productId.toString() === selection.productId.toString() &&
    (item.selectedMaterialId ?? null) === selection.selectedMaterialId &&
    (item.selectedColorId ?? null) === selection.selectedColorId &&
    (item.selectedSizeKey ?? null) === selection.selectedSizeKey
  );
}

export function buildElemMatchCriteria(selection: ProjectItemSelectionKey) {
  return {
    productId: selection.productId,
    selectedMaterialId: selection.selectedMaterialId,
    selectedColorId: selection.selectedColorId,
    selectedSizeKey: selection.selectedSizeKey,
  };
}
