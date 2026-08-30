import { describe, expect, it } from "vitest";
import {
  analyzeImageContentBounds,
  evaluateProductImageNormalization,
  expandBoundsWithPadding,
  getContentAreaRatio,
  WELL_FRAMED_CONTENT_AREA_RATIO,
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

describe("evaluateProductImageNormalization", () => {
  it("skips already normalized assets", () => {
    const bounds = {
      minX: 0,
      minY: 400,
      maxX: 925,
      maxY: 1079,
      contentWidth: 926,
      contentHeight: 680,
    };

    expect(
      evaluateProductImageNormalization(bounds, 926, 1080, {
        alreadyNormalized: true,
      }).shouldNormalize,
    ).toBe(false);
  });

  it("skips well-framed images like the Milano mustard photo", () => {
    const bounds = {
      minX: 20,
      minY: 60,
      maxX: 1140,
      maxY: 1280,
      contentWidth: 1121,
      contentHeight: 1221,
    };

    const decision = evaluateProductImageNormalization(bounds, 1164, 1351);
    expect(decision.shouldNormalize).toBe(false);
    expect(decision.reason).toBe("well_framed");
    expect(getContentAreaRatio(bounds, 1164, 1351)).toBeGreaterThanOrEqual(
      WELL_FRAMED_CONTENT_AREA_RATIO,
    );
  });

  it("normalizes images with excessive whitespace like the Milano green photo", () => {
    const bounds = {
      minX: 20,
      minY: 512,
      maxX: 905,
      maxY: 760,
      contentWidth: 886,
      contentHeight: 249,
    };

    const decision = evaluateProductImageNormalization(bounds, 926, 1080);
    expect(decision.shouldNormalize).toBe(true);
    expect(decision.reason).toBe("excess_whitespace");
    expect(getContentAreaRatio(bounds, 926, 1080)).toBeLessThan(
      WELL_FRAMED_CONTENT_AREA_RATIO,
    );
  });

  it("preserves the original when detection confidence is low", () => {
    const bounds = {
      minX: 0,
      minY: 0,
      maxX: 99,
      maxY: 99,
      contentWidth: 100,
      contentHeight: 100,
    };

    const decision = evaluateProductImageNormalization(bounds, 100, 100);
    expect(decision.shouldNormalize).toBe(false);
    expect(decision.reason).toBe("balanced_framing");
  });
});
