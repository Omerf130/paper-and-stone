import { Types } from "mongoose";
import type { IProjectItem } from "@/models/Project";

export type ProjectItemSelectionKey = {
  productId: Types.ObjectId;
  roomId?: Types.ObjectId | null;
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
  roomId?: Types.ObjectId | null,
): ProjectItemSelectionKey {
  return {
    productId,
    roomId: roomId ?? null,
    selectedMaterialId: normalizeOptionalId(selectedMaterialId),
    selectedColorId: normalizeOptionalId(selectedColorId),
    selectedSizeKey: normalizeOptionalId(selectedSizeKey),
  };
}

export function projectItemsMatchSelection(
  item: Pick<
    IProjectItem,
    | "productId"
    | "roomId"
    | "selectedMaterialId"
    | "selectedColorId"
    | "selectedSizeKey"
  >,
  selection: ProjectItemSelectionKey,
): boolean {
  return (
    item.productId.toString() === selection.productId.toString() &&
    (item.roomId?.toString() ?? null) === (selection.roomId?.toString() ?? null) &&
    (item.selectedMaterialId ?? null) === selection.selectedMaterialId &&
    (item.selectedColorId ?? null) === selection.selectedColorId &&
    (item.selectedSizeKey ?? null) === selection.selectedSizeKey
  );
}

export function buildElemMatchCriteria(selection: ProjectItemSelectionKey) {
  const criteria: Record<string, unknown> = {
    productId: selection.productId,
    selectedMaterialId: selection.selectedMaterialId,
    selectedColorId: selection.selectedColorId,
    selectedSizeKey: selection.selectedSizeKey,
  };

  if (selection.roomId) {
    criteria.roomId = selection.roomId;
  } else {
    criteria.roomId = null;
  }

  return criteria;
}
