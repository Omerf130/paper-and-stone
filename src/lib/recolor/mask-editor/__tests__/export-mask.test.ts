import { describe, expect, it, beforeAll } from "vitest";
import {
  buildExportImageData,
  maskHasContent,
} from "@/lib/recolor/mask-editor/export-mask";

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

describe("export-mask", () => {
  it("detects empty mask", () => {
    const mask = new ImageData(10, 10);
    expect(maskHasContent(mask)).toBe(false);
  });

  it("detects painted mask", () => {
    const mask = new ImageData(10, 10);
    mask.data[3] = 255;
    expect(maskHasContent(mask)).toBe(true);
  });

  it("exports transparent outside and white inside", () => {
    const mask = new ImageData(2, 1);
    mask.data.set([255, 255, 255, 255, 0, 0, 0, 0]);

    const exported = buildExportImageData(mask);
    expect(exported.width).toBe(2);
    expect(exported.height).toBe(1);
    expect(Array.from(exported.data.slice(0, 4))).toEqual([
      255, 255, 255, 255,
    ]);
    expect(Array.from(exported.data.slice(4, 8))).toEqual([0, 0, 0, 0]);
  });
});
