import { describe, expect, it } from "vitest";
import {
  ADMIN_PROJECT_ITEM_CARD_LAYERS,
  ADMIN_PROJECT_ITEM_HEADER_SECTIONS,
  ADMIN_PROJECT_ITEM_PRICING_FIELDS,
} from "@/components/admin/project-detail/AdminProjectItemPricingRow/admin-project-item-pricing-row-structure";

describe("admin-project-item-pricing-row-structure", () => {
  it("defines card layers as product/workflow header then pricing", () => {
    expect(ADMIN_PROJECT_ITEM_CARD_LAYERS).toEqual(["header", "pricing"]);
    expect(ADMIN_PROJECT_ITEM_HEADER_SECTIONS).toEqual(["product", "workflow"]);
  });

  it("keeps pricing fields separate from workflow header", () => {
    expect(ADMIN_PROJECT_ITEM_PRICING_FIELDS).toEqual([
      "internal",
      "markup",
      "architect",
      "client",
    ]);
    expect(ADMIN_PROJECT_ITEM_HEADER_SECTIONS).not.toContain("internal");
  });
});
