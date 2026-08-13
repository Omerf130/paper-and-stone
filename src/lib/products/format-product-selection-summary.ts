import type { ProductMaterialOptionView } from "@/types/product";

type SelectionSummaryInput = {
  material: ProductMaterialOptionView | null;
  color: ProductMaterialOptionView["colors"][number] | null;
  sizeLabel: string | null;
  showSize: boolean;
  quantity: number;
};

export type SelectionSummaryRow = {
  label: string;
  value: string;
};

export function formatProductSelectionSummary(
  input: SelectionSummaryInput,
): SelectionSummaryRow[] {
  const rows: SelectionSummaryRow[] = [];

  if (input.material) {
    rows.push({ label: "חומר", value: input.material.materialName });
  }

  if (input.color) {
    rows.push({ label: "צבע", value: input.color.name });
  }

  if (input.showSize && input.sizeLabel) {
    rows.push({ label: "מידה", value: input.sizeLabel });
  }

  rows.push({ label: "כמות", value: String(input.quantity) });

  return rows;
}
