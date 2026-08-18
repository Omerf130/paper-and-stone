import { describe, expect, it } from "vitest";
import {
  buildElemMatchCriteria,
  buildProjectItemSelectionKey,
  projectItemsMatchSelection,
} from "@/lib/projects/project-item-matching";
import { Types } from "mongoose";

describe("project-item-matching", () => {
  const productId = new Types.ObjectId("507f1f77bcf86cd799439012");

  it("matches exact duplicate configuration within the same room", () => {
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

  it("does not match duplicate configuration in a different room", () => {
    const roomA = new Types.ObjectId("507f1f77bcf86cd799439021");
    const roomB = new Types.ObjectId("507f1f77bcf86cd799439022");

    expect(
      projectItemsMatchSelection(
        {
          productId,
          roomId: roomA,
          selectedMaterialId: null,
          selectedColorId: null,
          selectedSizeKey: null,
        },
        buildProjectItemSelectionKey(productId, undefined, undefined, undefined, roomB),
      ),
    ).toBe(false);
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
      roomId: null,
      selectedMaterialId: null,
      selectedColorId: null,
      selectedSizeKey: null,
    });
  });
});
