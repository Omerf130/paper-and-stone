import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { trimProductImageBuffer } from "@/lib/media/trim-product-image";

type Rgb = { r: number; g: number; b: number };

const CANVAS_WIDTH = 1164;
const CANVAS_HEIGHT = 1351;

async function createSofaWhitespaceJpeg(
  width: number,
  height: number,
  background: Rgb,
  bandHeightRatio = 0.35,
): Promise<Buffer> {
  const bandHeight = Math.round(height * bandHeightRatio);
  const bandTop = Math.round((height - bandHeight) / 2);
  const sofa: Rgb = { r: 40, g: 35, b: 30 };
  const pixels = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inBand = y >= bandTop && y < bandTop + bandHeight;
      const color = inBand ? sofa : background;
      const index = (y * width + x) * 3;
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function createWideSofaWhitespaceJpeg(
  width: number,
  height: number,
): Promise<Buffer> {
  const bandHeight = Math.round(height * 0.4);
  const bandTop = Math.round((height - bandHeight) / 2);
  const sofa: Rgb = { r: 40, g: 35, b: 30 };
  const background: Rgb = { r: 255, g: 255, b: 255 };
  const pixels = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inBand = y >= bandTop && y < bandTop + bandHeight;
      const color = inBand ? sofa : background;
      const index = (y * width + x) * 3;
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function createTightSofaJpeg(
  width: number,
  height: number,
): Promise<Buffer> {
  const sofa: Rgb = { r: 40, g: 35, b: 30 };
  const background: Rgb = { r: 255, g: 255, b: 255 };
  const margin = Math.max(6, Math.round(Math.min(width, height) * 0.015));
  const pixels = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inset =
        x >= margin &&
        x < width - margin &&
        y >= margin &&
        y < height - margin;
      const color = inset ? sofa : background;
      const index = (y * width + x) * 3;
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function createGradientJpeg(width: number, height: number): Promise<Buffer> {
  const pixels = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 3;
      pixels[index] = Math.round((x / width) * 255);
      pixels[index + 1] = Math.round((y / height) * 255);
      pixels[index + 2] = 180;
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();
}

describe("trim-product-image", () => {
  it("trims white background vertical whitespace on sofa reproduction dimensions", async () => {
    const sourceWidth = 1152;
    const sourceHeight = 1337;
    const input = await createSofaWhitespaceJpeg(sourceWidth, sourceHeight, {
      r: 255,
      g: 255,
      b: 255,
    });

    const result = await trimProductImageBuffer(input);

    expect(result.trimmed).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.sourceWidth).toBe(sourceWidth);
    expect(result.sourceHeight).toBe(sourceHeight);
    expect(result.height).toBeLessThan(sourceHeight - 200);
    expect(result.height).toBeGreaterThan(400);
    expect(result.width).toBeGreaterThan(sourceWidth * 0.85);
    expect(result.width).toBeGreaterThan(result.height);
    expect(result.width).not.toBe(CANVAS_WIDTH);
    expect(result.height).not.toBe(CANVAS_HEIGHT);
    expect(result.contentBounds).toBeDefined();
  });

  it("trims near-white studio backgrounds", async () => {
    const input = await createSofaWhitespaceJpeg(900, 1100, {
      r: 248,
      g: 248,
      b: 248,
    });

    const result = await trimProductImageBuffer(input);
    expect(result.trimmed).toBe(true);
    expect(result.height).toBeLessThan(1100);
  });

  it("trims light gray studio backgrounds", async () => {
    const input = await createSofaWhitespaceJpeg(900, 1100, {
      r: 200,
      g: 200,
      b: 200,
    });

    const result = await trimProductImageBuffer(input);
    expect(result.trimmed).toBe(true);
    expect(result.height).toBeLessThan(1100);
  });

  it("skips already tight images and preserves dimensions", async () => {
    const sourceWidth = 700;
    const sourceHeight = 500;
    const input = await createTightSofaJpeg(sourceWidth, sourceHeight);

    const result = await trimProductImageBuffer(input);

    expect(result.skipped).toBe(true);
    expect(result.trimmed).toBe(false);
    expect(result.width).toBe(sourceWidth);
    expect(result.height).toBe(sourceHeight);
    expect(result.reason).toBe("already_tight");
  });

  it("returns byte-identical buffer when gradient background is skipped", async () => {
    const input = await createGradientJpeg(640, 480);

    const result = await trimProductImageBuffer(input);

    expect(result.skipped).toBe(true);
    expect(result.trimmed).toBe(false);
    expect(result.buffer.equals(input)).toBe(true);
    expect(result.buffer).toBe(input);
  });

  it("keeps wide sofa images naturally wide after trim", async () => {
    const sourceWidth = 1400;
    const sourceHeight = 900;
    const input = await createWideSofaWhitespaceJpeg(sourceWidth, sourceHeight);

    const result = await trimProductImageBuffer(input);

    expect(result.trimmed).toBe(true);
    expect(result.width).toBeGreaterThan(result.height);
    expect(result.width).toBeGreaterThan(sourceWidth * 0.85);
    expect(result.width).not.toBe(CANVAS_WIDTH);
    expect(result.height).not.toBe(CANVAS_HEIGHT);
  });

  it("increases content area ratio after trimming whitespace", async () => {
    const sourceWidth = 1152;
    const sourceHeight = 1337;
    const input = await createSofaWhitespaceJpeg(sourceWidth, sourceHeight, {
      r: 255,
      g: 255,
      b: 255,
    });

    const beforeAreaRatio = 0.35;
    const result = await trimProductImageBuffer(input);

    expect(result.trimmed).toBe(true);
    const afterAreaRatio =
      (result.width * result.height) / (sourceWidth * sourceHeight);
    expect(afterAreaRatio).toBeGreaterThan(beforeAreaRatio);
  });
});
