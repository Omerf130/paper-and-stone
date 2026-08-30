import sharp from "sharp";
import {
  analyzeImageContentBounds,
  DEFAULT_PADDING_RATIO,
  evaluateProductImageNormalization,
  expandBoundsWithPadding,
} from "@/lib/media/image-content-bounds";

export type NormalizeProductImageOptions = {
  alreadyNormalized?: boolean;
  paddingRatio?: number;
};

export type NormalizeProductImageResult = {
  buffer: Buffer;
  width: number;
  height: number;
  normalized: boolean;
  skipped: boolean;
  reason: string;
  mimeType: string;
};

function mimeTypeFromSharpFormat(format: string | undefined): string {
  if (format === "png") {
    return "image/png";
  }

  if (format === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

function outputMimeType(format: "jpeg" | "png" | "webp"): string {
  if (format === "png") {
    return "image/png";
  }

  if (format === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

export async function normalizeProductImageBuffer(
  input: Buffer,
  options: NormalizeProductImageOptions = {},
): Promise<NormalizeProductImageResult> {
  const image = sharp(input);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const sourceMimeType = mimeTypeFromSharpFormat(meta.format);

  if (!width || !height) {
    return {
      buffer: input,
      width,
      height,
      normalized: false,
      skipped: true,
      reason: "invalid_dimensions",
      mimeType: sourceMimeType,
    };
  }

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bounds = analyzeImageContentBounds(
    new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
    info.width,
    info.height,
    info.channels,
  );

  const decision = evaluateProductImageNormalization(
    bounds,
    info.width,
    info.height,
    { alreadyNormalized: options.alreadyNormalized },
  );

  if (!decision.shouldNormalize) {
    return {
      buffer: input,
      width,
      height,
      normalized: false,
      skipped: true,
      reason: decision.reason,
      mimeType: sourceMimeType,
    };
  }

  const padded = expandBoundsWithPadding(
    bounds,
    info.width,
    info.height,
    options.paddingRatio ?? DEFAULT_PADDING_RATIO,
  );

  const remainingAreaRatio =
    (padded.contentWidth * padded.contentHeight) / (info.width * info.height);

  if (remainingAreaRatio > 0.85) {
    return {
      buffer: input,
      width,
      height,
      normalized: false,
      skipped: true,
      reason: "minimal_adjustment",
      mimeType: sourceMimeType,
    };
  }

  const outputFormat: "jpeg" | "png" | "webp" =
    meta.format === "png"
      ? "png"
      : meta.format === "webp"
        ? "webp"
        : "jpeg";

  let pipeline = sharp(input).extract({
    left: padded.minX,
    top: padded.minY,
    width: padded.contentWidth,
    height: padded.contentHeight,
  });

  if (outputFormat === "jpeg") {
    pipeline = pipeline.jpeg({ quality: 92 });
  } else if (outputFormat === "webp") {
    pipeline = pipeline.webp({ quality: 92 });
  } else {
    pipeline = pipeline.png();
  }

  const output = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    normalized: true,
    skipped: false,
    reason: decision.reason,
    mimeType: outputMimeType(outputFormat),
  };
}
