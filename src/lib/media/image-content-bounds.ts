export type ImageContentBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  contentWidth: number;
  contentHeight: number;
};

export type NormalizationDecision = {
  shouldNormalize: boolean;
  reason: string;
  contentAreaRatio: number;
};

/** Images with at least this much non-background area are considered well-framed. */
export const WELL_FRAMED_CONTENT_AREA_RATIO = 0.78;

/** Padding around detected content — roughly 2–4% of the larger image dimension. */
export const DEFAULT_PADDING_RATIO = 0.03;

const BRIGHTNESS_THRESHOLD = 245;
const ALPHA_THRESHOLD = 16;

export function analyzeImageContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  channels = 4,
): ImageContentBounds {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = channels === 4 ? data[index + 3] : 255;
      const brightness = (red + green + blue) / 3;
      const isContent =
        alpha > ALPHA_THRESHOLD && brightness < BRIGHTNESS_THRESHOLD;

      if (isContent) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      minX: 0,
      minY: 0,
      maxX: width - 1,
      maxY: height - 1,
      contentWidth: width,
      contentHeight: height,
    };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    contentWidth: maxX - minX + 1,
    contentHeight: maxY - minY + 1,
  };
}

export function expandBoundsWithPadding(
  bounds: ImageContentBounds,
  imageWidth: number,
  imageHeight: number,
  paddingRatio = DEFAULT_PADDING_RATIO,
): ImageContentBounds {
  const padding = Math.max(
    4,
    Math.round(Math.max(imageWidth, imageHeight) * paddingRatio),
  );
  const minX = Math.max(0, bounds.minX - padding);
  const minY = Math.max(0, bounds.minY - padding);
  const maxX = Math.min(imageWidth - 1, bounds.maxX + padding);
  const maxY = Math.min(imageHeight - 1, bounds.maxY + padding);

  return {
    minX,
    minY,
    maxX,
    maxY,
    contentWidth: maxX - minX + 1,
    contentHeight: maxY - minY + 1,
  };
}

export function getContentAreaRatio(
  bounds: ImageContentBounds,
  imageWidth: number,
  imageHeight: number,
): number {
  return (
    (bounds.contentWidth * bounds.contentHeight) / (imageWidth * imageHeight)
  );
}

export function getMaxContentMarginRatio(
  bounds: ImageContentBounds,
  imageWidth: number,
  imageHeight: number,
): number {
  return Math.max(
    bounds.minX / imageWidth,
    bounds.minY / imageHeight,
    (imageWidth - 1 - bounds.maxX) / imageWidth,
    (imageHeight - 1 - bounds.maxY) / imageHeight,
  );
}

export function evaluateProductImageNormalization(
  bounds: ImageContentBounds,
  imageWidth: number,
  imageHeight: number,
  options: { alreadyNormalized?: boolean } = {},
): NormalizationDecision {
  const contentAreaRatio = getContentAreaRatio(bounds, imageWidth, imageHeight);
  const maxMargin = getMaxContentMarginRatio(bounds, imageWidth, imageHeight);

  if (options.alreadyNormalized) {
    return {
      shouldNormalize: false,
      reason: "already_normalized",
      contentAreaRatio,
    };
  }

  if (maxMargin <= DEFAULT_PADDING_RATIO * 1.5) {
    return {
      shouldNormalize: false,
      reason: "balanced_framing",
      contentAreaRatio,
    };
  }

  if (contentAreaRatio >= WELL_FRAMED_CONTENT_AREA_RATIO) {
    return {
      shouldNormalize: false,
      reason: "well_framed",
      contentAreaRatio,
    };
  }

  if (
    bounds.contentWidth === imageWidth &&
    bounds.contentHeight === imageHeight
  ) {
    return {
      shouldNormalize: false,
      reason: "detection_uncertain",
      contentAreaRatio,
    };
  }

  return {
    shouldNormalize: true,
    reason: "excess_whitespace",
    contentAreaRatio,
  };
}
