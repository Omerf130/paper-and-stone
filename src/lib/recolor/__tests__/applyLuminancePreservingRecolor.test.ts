import { describe, expect, it, beforeAll } from "vitest";
import {
  applyLuminancePreservingRecolor,
  imageDimensionsMatch,
} from "@/lib/recolor/applyLuminancePreservingRecolor";

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

describe("applyLuminancePreservingRecolor", () => {
  it("preserves original pixel outside the mask", () => {
    const source = new ImageData(2, 1);
    source.data.set([100, 120, 140, 255, 10, 20, 30, 255]);

    const mask = new ImageData(2, 1);
    mask.data.set([0, 0, 0, 0, 255, 255, 255, 255]);

    const result = applyLuminancePreservingRecolor(source, mask, "#FF0000");

    expect(Array.from(result.data.slice(0, 4))).toEqual([100, 120, 140, 255]);
    expect(result.data[4]).not.toBe(10);
  });

  it("changes masked pixels toward the target hue", () => {
    const source = new ImageData(1, 1);
    source.data.set([40, 40, 40, 255]);

    const mask = new ImageData(1, 1);
    mask.data.set([255, 255, 255, 255]);

    const result = applyLuminancePreservingRecolor(source, mask, "#0000FF");

    expect(result.data[2]).toBeGreaterThan(result.data[0]);
    expect(result.data[2]).toBeGreaterThan(result.data[1]);
  });
});

describe("imageDimensionsMatch", () => {
  it("matches equal dimensions", () => {
    expect(imageDimensionsMatch(800, 600, 800, 600)).toBe(true);
  });

  it("rejects mismatched dimensions", () => {
    expect(imageDimensionsMatch(800, 600, 801, 600)).toBe(false);
  });
});
