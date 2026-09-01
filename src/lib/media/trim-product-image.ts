import sharp from "sharp";
import {
  detectBackgroundContentBounds,
  type ContentBounds,
} from "@/lib/media/detect-background-content-bounds";

export type TrimProductImageResult = {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  trimmed: boolean;
  skipped: boolean;
  reason: string;
  sourceWidth: number;
  sourceHeight: number;
  contentBounds?: ContentBounds;
};

const ENCODE_QUALITY = 92;

function resolveOutputFormat(
  format: keyof sharp.FormatEnum | undefined,
): { format: keyof sharp.FormatEnum; mimeType: string } | null {
  switch (format) {
    case "jpeg":
      return { format: "jpeg", mimeType: "image/jpeg" };
    case "png":
      return { format: "png", mimeType: "image/png" };
    case "webp":
      return { format: "webp", mimeType: "image/webp" };
    default:
      return null;
  }
}

export async function trimProductImageBuffer(
  input: Buffer,
): Promise<TrimProductImageResult> {
  const originalBuffer = input;

  const metadata = await sharp(originalBuffer).metadata();
  const formatInfo = resolveOutputFormat(metadata.format);

  if (!formatInfo) {
    return {
      buffer: originalBuffer,
      mimeType: "application/octet-stream",
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      trimmed: false,
      skipped: true,
      reason: "unsupported_format",
      sourceWidth: metadata.width ?? 0,
      sourceHeight: metadata.height ?? 0,
    };
  }

  const { data, info } = await sharp(originalBuffer)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sourceWidth = info.width;
  const sourceHeight = info.height;

  const detection = detectBackgroundContentBounds(
    data,
    sourceWidth,
    sourceHeight,
    info.channels,
  );

  if (!detection.ok) {
    return {
      buffer: originalBuffer,
      mimeType: formatInfo.mimeType,
      width: sourceWidth,
      height: sourceHeight,
      trimmed: false,
      skipped: true,
      reason: detection.reason,
      sourceWidth,
      sourceHeight,
    };
  }

  const { bounds } = detection;

  let pipeline = sharp(originalBuffer)
    .rotate()
    .extract({
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

  if (formatInfo.format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: ENCODE_QUALITY });
  } else if (formatInfo.format === "webp") {
    pipeline = pipeline.webp({ quality: ENCODE_QUALITY });
  } else {
    pipeline = pipeline.png();
  }

  const trimmedBuffer = await pipeline.toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();

  return {
    buffer: trimmedBuffer,
    mimeType: formatInfo.mimeType,
    width: trimmedMeta.width ?? bounds.width,
    height: trimmedMeta.height ?? bounds.height,
    trimmed: true,
    skipped: false,
    reason: "trimmed",
    sourceWidth,
    sourceHeight,
    contentBounds: bounds,
  };
}
