import { describe, expect, it } from "vitest";
import {
  moveArrayItemDown,
  moveArrayItemUp,
  moveSectionOrderDown,
  moveSectionOrderUp,
  normalizeArrayOrder,
} from "@/lib/cms/homepage-array-helpers";
import { DEFAULT_HOMEPAGE_SECTION_ORDER } from "@/types/cms-content";

describe("homepage-array-helpers", () => {
  it("normalizes order values sequentially", () => {
    const normalized = normalizeArrayOrder([
      { id: "a", order: 5 },
      { id: "b", order: 0 },
    ]);

    expect(normalized.map((item) => item.order)).toEqual([0, 1]);
  });

  it("moves array items up and down", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const movedUp = moveArrayItemUp(items, 2);
    expect(movedUp.map((item) => item.id)).toEqual(["a", "c", "b"]);

    const movedDown = moveArrayItemDown(items, 0);
    expect(movedDown.map((item) => item.id)).toEqual(["b", "a", "c"]);
  });

  it("keeps hero first when reordering sections", () => {
    const order = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
    const moved = moveSectionOrderUp(order, 1);
    expect(moved).toEqual(order);

    const movedDown = moveSectionOrderDown(order, 0);
    expect(movedDown).toEqual(order);
  });

  it("allows reordering non-hero sections", () => {
    const order = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
    const movedDown = moveSectionOrderDown(order, 1);
    expect(movedDown[1]).toBe("featuredProducts");
    expect(movedDown[2]).toBe("categories");
  });
});
