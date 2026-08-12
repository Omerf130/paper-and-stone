import { describe, expect, it, beforeAll } from "vitest";
import {
  createEmptyMask,
  importMaskFromImageData,
} from "@/lib/recolor/mask-editor/import-mask";

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

describe("import-mask", () => {
  it("creates an empty mask at natural dimensions", () => {
    const mask = createEmptyMask(100, 50);
    expect(mask.width).toBe(100);
    expect(mask.height).toBe(50);
    expect(mask.data.every((value) => value === 0)).toBe(true);
  });

  it("imports renderer-compatible mask pixels", () => {
    const source = new ImageData(2, 1);
    source.data.set([0, 0, 0, 0, 255, 255, 255, 255]);

    const mask = importMaskFromImageData(source);
    expect(Array.from(mask.data.slice(0, 4))).toEqual([0, 0, 0, 0]);
    expect(Array.from(mask.data.slice(4, 8))).toEqual([
      255, 255, 255, 255,
    ]);
  });

  it("imports semi-transparent alpha as painted", () => {
    const source = new ImageData(1, 1);
    source.data.set([0, 0, 0, 128]);

    const mask = importMaskFromImageData(source);
    expect(mask.data[3]).toBe(255);
  });
});
