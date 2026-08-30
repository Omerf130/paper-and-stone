import { describe, expect, it } from "vitest";
import {
  analyzeImageContentBounds,
  expandBoundsWithPadding,
} from "@/lib/media/image-content-bounds";

describe("analyzeImageContentBounds", () => {
  it("detects the non-white product region", () => {
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4).fill(255);

    for (let y = 3; y <= 6; y += 1) {
      for (let x = 2; x <= 7; x += 1) {
        const index = (y * width + x) * 4;
        data[index] = 20;
        data[index + 1] = 20;
        data[index + 2] = 20;
        data[index + 3] = 255;
      }
    }

    expect(analyzeImageContentBounds(data, width, height)).toEqual({
      minX: 2,
      minY: 3,
      maxX: 7,
      maxY: 6,
      contentWidth: 6,
      contentHeight: 4,
    });
  });
});

describe("expandBoundsWithPadding", () => {
  it("adds padding without leaving the image bounds", () => {
    const padded = expandBoundsWithPadding(
      {
        minX: 40,
        minY: 500,
        maxX: 900,
        maxY: 760,
        contentWidth: 861,
        contentHeight: 261,
      },
      926,
      1080,
      0.025,
    );

    expect(padded.minX).toBeLessThan(40);
    expect(padded.minY).toBeLessThan(500);
    expect(padded.maxX).toBeGreaterThan(900);
    expect(padded.maxY).toBeGreaterThan(760);
    expect(padded.minX).toBeGreaterThanOrEqual(0);
    expect(padded.maxY).toBeLessThanOrEqual(1079);
  });
});
