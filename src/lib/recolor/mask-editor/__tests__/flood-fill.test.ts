import { describe, expect, it, beforeAll } from "vitest";
import { floodFillMask } from "@/lib/recolor/mask-editor/flood-fill";

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

describe("floodFillMask", () => {
  it("fills a contiguous empty region when painting", () => {
    const mask = new ImageData(4, 4);
    const changed = floodFillMask(mask, { x: 1, y: 1 }, "paint");

    expect(changed).toBe(true);
    expect(mask.data[(1 * 4 + 1) * 4 + 3]).toBe(255);
    expect(mask.data[(2 * 4 + 2) * 4 + 3]).toBe(255);
  });

  it("does not fill when target region already matches", () => {
    const mask = new ImageData(3, 3);
    floodFillMask(mask, { x: 0, y: 0 }, "paint");

    const changed = floodFillMask(mask, { x: 1, y: 1 }, "paint");
    expect(changed).toBe(false);
  });

  it("erases a contiguous painted region", () => {
    const mask = new ImageData(3, 3);
    floodFillMask(mask, { x: 0, y: 0 }, "paint");

    const changed = floodFillMask(mask, { x: 1, y: 1 }, "erase");
    expect(changed).toBe(true);
    expect(mask.data[(1 * 3 + 1) * 4 + 3]).toBe(0);
  });
});
