import { describe, expect, it } from "vitest";
import {
  ALREADY_TIGHT_CONTENT_RATIO,
  BASE_COLOR_TOLERANCE,
  detectBackgroundContentBounds,
  EDGE_SAMPLE_RATIO,
  MAX_REMOVABLE_AREA_RATIO,
  MIN_USEFUL_TRIM_AREA_SAVINGS,
  SAFETY_MARGIN_MIN_PX,
  SAFETY_MARGIN_RATIO,
} from "@/lib/media/detect-background-content-bounds";

type Rgb = { r: number; g: number; b: number };

function expandBoundsWithSafetyMargin(
  bounds: { left: number; top: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number,
) {
  const marginX = Math.max(
    SAFETY_MARGIN_MIN_PX,
    Math.round(bounds.width * SAFETY_MARGIN_RATIO),
  );
  const marginY = Math.max(
    SAFETY_MARGIN_MIN_PX,
    Math.round(bounds.height * SAFETY_MARGIN_RATIO),
  );

  const left = Math.max(0, bounds.left - marginX);
  const top = Math.max(0, bounds.top - marginY);
  const right = Math.min(imageWidth, bounds.left + bounds.width + marginX);
  const bottom = Math.min(imageHeight, bounds.top + bounds.height + marginY);

  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function createRawImage(
  width: number,
  height: number,
  paint: (x: number, y: number) => Rgb,
  channels = 4,
): Buffer {
  const data = Buffer.alloc(width * height * channels);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = paint(x, y);
      const index = (y * width + x) * channels;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      if (channels === 4) {
        data[index + 3] = 255;
      }
    }
  }

  return data;
}

function createSofaWhitespaceRaw(
  width: number,
  height: number,
  background: Rgb,
  bandHeightRatio = 0.35,
): Buffer {
  const bandHeight = Math.round(height * bandHeightRatio);
  const bandTop = Math.round((height - bandHeight) / 2);
  const sofa: Rgb = { r: 40, g: 35, b: 30 };

  return createRawImage(width, height, (_x, y) =>
    y >= bandTop && y < bandTop + bandHeight ? sofa : background,
  );
}

describe("detect-background-content-bounds", () => {
  it("exports centralized threshold constants", () => {
    expect(EDGE_SAMPLE_RATIO).toBeGreaterThan(0);
    expect(BASE_COLOR_TOLERANCE).toBeGreaterThan(0);
    expect(MIN_USEFUL_TRIM_AREA_SAVINGS).toBeGreaterThan(0);
    expect(ALREADY_TIGHT_CONTENT_RATIO).toBeGreaterThan(0.5);
    expect(MAX_REMOVABLE_AREA_RATIO).toBeGreaterThan(0.5);
    expect(SAFETY_MARGIN_RATIO).toBeGreaterThan(0);
    expect(SAFETY_MARGIN_MIN_PX).toBeGreaterThan(0);
  });

  it("detects removable vertical whitespace on white background", () => {
    const width = 1152;
    const height = 1337;
    const data = createSofaWhitespaceRaw(width, height, { r: 255, g: 255, b: 255 });

    const result = detectBackgroundContentBounds(data, width, height);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.bounds.top).toBeGreaterThan(100);
    expect(result.bounds.height).toBeLessThan(height - 200);
    expect(result.bounds.width).toBeGreaterThan(width * 0.9);
    expect(result.contentAreaRatio).toBeGreaterThan(0.35);
  });

  it("detects near-white studio backgrounds", () => {
    const width = 800;
    const height = 900;
    const data = createSofaWhitespaceRaw(width, height, { r: 248, g: 248, b: 248 });

    const result = detectBackgroundContentBounds(data, width, height);
    expect(result.ok).toBe(true);
  });

  it("detects light gray studio backgrounds", () => {
    const width = 800;
    const height = 900;
    const data = createSofaWhitespaceRaw(width, height, { r: 200, g: 200, b: 200 });

    const result = detectBackgroundContentBounds(data, width, height);
    expect(result.ok).toBe(true);
  });

  it("skips already tight images", () => {
    const width = 600;
    const height = 400;
    const sofa: Rgb = { r: 40, g: 35, b: 30 };
    const background: Rgb = { r: 255, g: 255, b: 255 };
    const margin = 8;

    const data = createRawImage(width, height, (x, y) => {
      const inset =
        x >= margin &&
        x < width - margin &&
        y >= margin &&
        y < height - margin;

      return inset ? sofa : background;
    });

    const result = detectBackgroundContentBounds(data, width, height);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.reason).toBe("already_tight");
  });

  it("skips gradient backgrounds with edge disagreement", () => {
    const width = 640;
    const height = 480;
    const data = createRawImage(width, height, (x, y) => ({
      r: Math.round((x / width) * 255),
      g: Math.round((y / height) * 255),
      b: 180,
    }));

    const result = detectBackgroundContentBounds(data, width, height);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(["edge_disagreement", "edge_variance_too_high"]).toContain(
      result.reason,
    );
  });

  it("expands bounds with configured safety margin", () => {
    const bounds = { left: 100, top: 120, width: 400, height: 300 };
    const expanded = expandBoundsWithSafetyMargin(bounds, 1000, 800);

    expect(expanded.left).toBeLessThan(bounds.left);
    expect(expanded.top).toBeLessThan(bounds.top);
    expect(expanded.width).toBeGreaterThan(bounds.width);
    expect(expanded.height).toBeGreaterThan(bounds.height);
    expect(bounds.left - expanded.left).toBeGreaterThanOrEqual(
      SAFETY_MARGIN_MIN_PX,
    );
    expect(bounds.top - expanded.top).toBeGreaterThanOrEqual(
      SAFETY_MARGIN_MIN_PX,
    );
  });

  it("allows vertical whitespace trim when content spans most of the width", () => {
    const width = 1164;
    const height = 1351;
    const bandHeight = 316;
    const bandTop = 546;
    const sofa: Rgb = { r: 40, g: 35, b: 30 };
    const background: Rgb = { r: 255, g: 255, b: 255 };

    const data = createRawImage(width, height, (_x, y) =>
      y >= bandTop && y < bandTop + bandHeight ? sofa : background,
    );

    const result = detectBackgroundContentBounds(data, width, height);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.bounds.height).toBeLessThan(height * 0.35);
    expect(result.bounds.width).toBeGreaterThan(width * 0.85);
  });
});