import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { normalizeProductImageBuffer } from "@/lib/media/normalize-product-image";

async function createWhitespaceFixture() {
  const content = await sharp({
    create: {
      width: 40,
      height: 20,
      channels: 3,
      background: { r: 40, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: 120,
      height: 120,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: content, top: 80, left: 40 }])
    .jpeg()
    .toBuffer();
}

async function createWellFramedFixture() {
  return sharp({
    create: {
      width: 80,
      height: 80,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 70,
            height: 70,
            channels: 3,
            background: { r: 30, g: 30, b: 30 },
          },
        })
          .png()
          .toBuffer(),
        top: 5,
        left: 5,
      },
    ])
    .jpeg()
    .toBuffer();
}

describe("normalizeProductImageBuffer", () => {
  it("normalizes images with excessive whitespace", async () => {
    const input = await createWhitespaceFixture();
    const result = await normalizeProductImageBuffer(input);

    expect(result.normalized).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.height).toBeLessThan(120);
    expect(result.width).toBeLessThan(120);
  });

  it("does not aggressively crop already well-framed images", async () => {
    const input = await createWellFramedFixture();
    const result = await normalizeProductImageBuffer(input);

    expect(result.normalized).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("well_framed");
    expect(result.buffer.equals(input)).toBe(true);
  });

  it("keeps safe padding around detected content", async () => {
    const input = await createWhitespaceFixture();
    const result = await normalizeProductImageBuffer(input);
    const meta = await sharp(result.buffer).metadata();

    expect(result.normalized).toBe(true);
    expect(meta.width).toBeGreaterThan(40);
    expect(meta.height).toBeGreaterThan(20);
  });

  it("is idempotent when normalized flag is set", async () => {
    const input = await createWhitespaceFixture();
    const first = await normalizeProductImageBuffer(input);
    const second = await normalizeProductImageBuffer(first.buffer, {
      alreadyNormalized: true,
    });

    expect(first.normalized).toBe(true);
    expect(second.normalized).toBe(false);
    expect(second.reason).toBe("already_normalized");
    expect(second.buffer.equals(first.buffer)).toBe(true);
  });

  it("preserves the original when detection confidence is low", async () => {
    const input = await sharp({
      create: {
        width: 40,
        height: 40,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await normalizeProductImageBuffer(input);
    expect(result.normalized).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("balanced_framing");
  });

  it("repeated normalization stays safe after first crop", async () => {
    const input = await createWhitespaceFixture();
    const first = await normalizeProductImageBuffer(input);
    const second = await normalizeProductImageBuffer(first.buffer);

    expect(first.normalized).toBe(true);
    expect(second.normalized).toBe(false);
    expect(second.reason).toBe("minimal_adjustment");
    expect(second.buffer.equals(first.buffer)).toBe(true);
  });
});
