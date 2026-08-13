import { describe, expect, it } from "vitest";
import {
  getProjectItemConfigurationRows,
  getReviewUnavailableCopy,
} from "@/lib/projects/project-display-helpers";
import type { ProjectItemView } from "@/types/project";

function createItem(
  overrides: Partial<ProjectItemView> = {},
): ProjectItemView {
  return {
    id: "item-1",
    productId: "product-1",
    selectedMaterialId: null,
    selectedColorId: null,
    selectedSizeKey: null,
    quantity: 2,
    snapshot: {
      productName: "שולחן",
      productSlug: "table-01",
      sku: "SKU-001",
      materialName: "עץ",
      colorName: "אגוז",
      colorHex: "#5c4033",
      sizeLabel: "180×90",
    },
    isProductActive: true,
    ...overrides,
  };
}

describe("getProjectItemConfigurationRows", () => {
  it("returns structured rows for a full snapshot", () => {
    const rows = getProjectItemConfigurationRows(createItem());

    expect(rows).toEqual([
      { label: "חומר", value: "עץ" },
      { label: "צבע", value: "אגוז", swatchHex: "#5c4033" },
      { label: "מידה", value: "180×90" },
      { label: "כמות", value: "2" },
      { label: 'מק"ט', value: "SKU-001", dir: "ltr" },
    ]);
  });

  it("omits optional fields and falls back to product slug when sku is missing", () => {
    const rows = getProjectItemConfigurationRows(
      createItem({
        quantity: 1,
        snapshot: {
          productName: "כיסא",
          productSlug: "chair-02",
        },
      }),
    );

    expect(rows).toEqual([
      { label: "כמות", value: "1" },
      { label: "מזהה מוצר", value: "chair-02", dir: "ltr" },
    ]);
  });

  it("prefers sku over product slug", () => {
    const rows = getProjectItemConfigurationRows(createItem());
    const identifiers = rows.filter(
      (row) => row.label === 'מק"ט' || row.label === "מזהה מוצר",
    );

    expect(identifiers).toHaveLength(1);
    expect(identifiers[0]?.label).toBe('מק"ט');
  });
});

describe("getReviewUnavailableCopy", () => {
  it("returns status-specific copy", () => {
    expect(getReviewUnavailableCopy("approved")).toContain("אושר");
    expect(getReviewUnavailableCopy("rejected")).toContain("נדחה");
    expect(getReviewUnavailableCopy("changes_requested")).toContain("שינויים");
    expect(getReviewUnavailableCopy("draft")).toContain("טיוטה");
  });
});
