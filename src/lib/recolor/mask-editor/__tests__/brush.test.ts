import { describe, expect, it, beforeAll } from "vitest";
import {
  applyBrushDab,
  applyBrushStroke,
} from "@/lib/recolor/mask-editor/brush";

beforeAll(() => {
  class MockImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  }

  global.ImageData = MockImageData as typeof ImageData;
});

describe("brush", () => {
  it("paints white opaque pixels", () => {
    const mask = new ImageData(10, 10);
    const changed = applyBrushDab(mask, { x: 5, y: 5 }, 3, "paint");

    expect(changed).toBe(true);
    const index = (5 * 10 + 5) * 4;
    expect(Array.from(mask.data.slice(index, index + 4))).toEqual([
      255, 255, 255, 255,
    ]);
  });

  it("erases painted pixels", () => {
    const mask = new ImageData(10, 10);
    applyBrushDab(mask, { x: 5, y: 5 }, 3, "paint");
    const changed = applyBrushDab(mask, { x: 5, y: 5 }, 3, "erase");

    expect(changed).toBe(true);
    const index = (5 * 10 + 5) * 4;
    expect(mask.data[index + 3]).toBe(0);
  });

  it("applies brush stroke along a line", () => {
    const mask = new ImageData(20, 20);
    const changed = applyBrushStroke(
      mask,
      { x: 2, y: 2 },
      { x: 18, y: 18 },
      2,
      "paint",
    );

    expect(changed).toBe(true);
    expect(mask.data[(10 * 20 + 10) * 4 + 3]).toBe(255);
  });
});
