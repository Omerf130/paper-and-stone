import { describe, expect, it } from "vitest";
import {
  buildElemMatchCriteria,
  projectItemsMatchSelection,
} from "@/lib/projects/project-item-matching";
import { Types } from "mongoose";

describe("project-item-matching", () => {
  const productId = new Types.ObjectId("507f1f77bcf86cd799439012");

  it("matches exact duplicate configuration", () => {
    const selection = {
      productId,
      selectedMaterialId: "mat-1",
      selectedColorId: "color-1",
      selectedSizeKey: "260",
    };

    expect(
      projectItemsMatchSelection(
        {
          productId,
          selectedMaterialId: "mat-1",
          selectedColorId: "color-1",
          selectedSizeKey: "260",
        },
        selection,
      ),
    ).toBe(true);
  });

  it("builds elemMatch criteria with null optional fields", () => {
    expect(
      buildElemMatchCriteria({
        productId,
        selectedMaterialId: null,
        selectedColorId: null,
        selectedSizeKey: null,
      }),
    ).toEqual({
      productId,
      selectedMaterialId: null,
      selectedColorId: null,
      selectedSizeKey: null,
    });
  });
});
