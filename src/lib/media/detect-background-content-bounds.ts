export type ContentBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DetectionSuccess = {
  ok: true;
  bounds: ContentBounds;
  contentAreaRatio: number;
};

export type DetectionFailure = {
  ok: false;
  reason: string;
};

export type DetectionResult = DetectionSuccess | DetectionFailure;

/** Fraction of min(imageW, imageH) used for outer edge sampling bands. */
export const EDGE_SAMPLE_RATIO = 0.02;

/** Minimum pixel thickness of edge sampling bands. */
export const MIN_EDGE_SAMPLE_PX = 6;

/** Base per-channel RGB distance treated as background when edge variance is low. */
export const BASE_COLOR_TOLERANCE = 15;

/** Multiplier applied to per-channel MAD for adaptive background tolerance. */
export const MAD_MULTIPLIER = 2.5;

/** Max median RGB disagreement between corner patches before background is uncertain. */
export const MAX_EDGE_DISAGREEMENT = 28;

/** Max per-channel MAD before edge background is considered inconsistent. */
export const MAX_CHANNEL_MAD = 24;

/** Skip trim when removal would save less than this fraction of total image area. */
export const MIN_USEFUL_TRIM_AREA_SAVINGS = 0.03;

/** Skip trim when detected content already covers at least this fraction. */
export const ALREADY_TIGHT_CONTENT_RATIO = 0.9;

/** Skip trim when removal would exceed this fraction of total image area. */
export const MAX_REMOVABLE_AREA_RATIO = 0.65;

/** Skip trim when detected content is smaller than this fraction of image area. */
export const MIN_DETECTED_CONTENT_AREA_RATIO = 0.05;

/** Safety margin added around detected content as a fraction of crop dimension. */
export const SAFETY_MARGIN_RATIO = 0.02;

/** Minimum safety margin in pixels on each side of detected content. */
export const SAFETY_MARGIN_MIN_PX = 12;

/** Minimum content margin from image edge before treating edge-touch as risky. */
export const MIN_CONTENT_EDGE_MARGIN_PX = 4;

/** Max image sides content may touch when margin is thin before skipping trim. */
export const MAX_RISKY_EDGE_TOUCH_SIDES = 2;

/**
 * Min fraction of image width detected content must span to allow large vertical
 * whitespace removal (wide furniture band with top/bottom studio padding).
 */
export const MIN_WIDTH_COVERAGE_FOR_VERTICAL_WHITESPACE_TRIM = 0.75;

/**
 * Max fraction of image height for the vertical-whitespace trim pattern.
 * Content taller than this is not treated as a horizontal band.
 */
export const MAX_HEIGHT_COVERAGE_FOR_VERTICAL_WHITESPACE_TRIM = 0.5;

type Rgb = { r: number; g: number; b: number };

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

function medianAbsoluteDeviation(values: number[], center: number): number {
  if (values.length === 0) {
    return 0;
  }

  return median(values.map((value) => Math.abs(value - center)));
}

function rgbDistance(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

function medianRgb(samples: Rgb[]): Rgb {
  return {
    r: median(samples.map((sample) => sample.r)),
    g: median(samples.map((sample) => sample.g)),
    b: median(samples.map((sample) => sample.b)),
  };
}

function isBackgroundPixel(
  pixel: Rgb,
  background: Rgb,
  tolerance: number,
): boolean {
  return rgbDistance(pixel, background) <= tolerance;
}

function sampleEdgePixels(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): Rgb[] {
  const band = Math.max(
    MIN_EDGE_SAMPLE_PX,
    Math.round(Math.min(width, height) * EDGE_SAMPLE_RATIO),
  );
  const samples: Rgb[] = [];

  const pushPixel = (x: number, y: number) => {
    const index = (y * width + x) * channels;
    samples.push({
      r: data[index] ?? 0,
      g: data[index + 1] ?? 0,
      b: data[index + 2] ?? 0,
    });
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const onEdge =
        x < band ||
        x >= width - band ||
        y < band ||
        y >= height - band;

      if (onEdge) {
        pushPixel(x, y);
      }
    }
  }

  return samples;
}

function sampleCornerPatch(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
  corner: "tl" | "tr" | "bl" | "br",
): Rgb[] {
  const patch = Math.max(
    MIN_EDGE_SAMPLE_PX,
    Math.round(Math.min(width, height) * EDGE_SAMPLE_RATIO),
  );
  const samples: Rgb[] = [];

  const xStart =
    corner === "tl" || corner === "bl" ? 0 : Math.max(0, width - patch);
  const xEnd =
    corner === "tl" || corner === "bl" ? Math.min(width, patch) : width;
  const yStart =
    corner === "tl" || corner === "tr" ? 0 : Math.max(0, height - patch);
  const yEnd =
    corner === "tl" || corner === "tr" ? Math.min(height, patch) : height;

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const index = (y * width + x) * channels;
      samples.push({
        r: data[index] ?? 0,
        g: data[index + 1] ?? 0,
        b: data[index + 2] ?? 0,
      });
    }
  }

  return samples;
}

function computeAdaptiveTolerance(samples: Rgb[], background: Rgb): number {
  const channelMads = (["r", "g", "b"] as const).map((channel) =>
    medianAbsoluteDeviation(
      samples.map((sample) => sample[channel]),
      background[channel],
    ),
  );

  const maxMad = Math.max(...channelMads);

  if (maxMad > MAX_CHANNEL_MAD) {
    return Number.POSITIVE_INFINITY;
  }

  return BASE_COLOR_TOLERANCE + maxMad * MAD_MULTIPLIER;
}

function edgeBackgroundIsConsistent(
  width: number,
  height: number,
  data: Buffer,
  channels: number,
): boolean {
  const corners = [
    sampleCornerPatch(data, width, height, channels, "tl"),
    sampleCornerPatch(data, width, height, channels, "tr"),
    sampleCornerPatch(data, width, height, channels, "bl"),
    sampleCornerPatch(data, width, height, channels, "br"),
  ].map(medianRgb);

  for (let index = 0; index < corners.length; index += 1) {
    for (let other = index + 1; other < corners.length; other += 1) {
      if (rgbDistance(corners[index], corners[other]) > MAX_EDGE_DISAGREEMENT) {
        return false;
      }
    }
  }

  return true;
}

function expandBoundsWithSafetyMargin(
  bounds: ContentBounds,
  imageWidth: number,
  imageHeight: number,
): ContentBounds {
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

function countRiskyEdgeTouches(
  bounds: ContentBounds,
  imageWidth: number,
  imageHeight: number,
): number {
  let touches = 0;

  if (bounds.left <= MIN_CONTENT_EDGE_MARGIN_PX) {
    touches += 1;
  }

  if (bounds.top <= MIN_CONTENT_EDGE_MARGIN_PX) {
    touches += 1;
  }

  if (bounds.left + bounds.width >= imageWidth - MIN_CONTENT_EDGE_MARGIN_PX) {
    touches += 1;
  }

  if (bounds.top + bounds.height >= imageHeight - MIN_CONTENT_EDGE_MARGIN_PX) {
    touches += 1;
  }

  return touches;
}

export function detectBackgroundContentBounds(
  data: Buffer,
  width: number,
  height: number,
  channels = 4,
): DetectionResult {
  if (width <= 0 || height <= 0 || data.length < width * height * channels) {
    return { ok: false, reason: "invalid_dimensions" };
  }

  const edgeSamples = sampleEdgePixels(data, width, height, channels);

  if (edgeSamples.length === 0) {
    return { ok: false, reason: "no_edge_samples" };
  }

  if (!edgeBackgroundIsConsistent(width, height, data, channels)) {
    return { ok: false, reason: "edge_disagreement" };
  }

  const background = medianRgb(edgeSamples);
  const tolerance = computeAdaptiveTolerance(edgeSamples, background);

  if (!Number.isFinite(tolerance)) {
    return { ok: false, reason: "edge_variance_too_high" };
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const pixel: Rgb = {
        r: data[index] ?? 0,
        g: data[index + 1] ?? 0,
        b: data[index + 2] ?? 0,
      };

      if (isBackgroundPixel(pixel, background, tolerance)) {
        continue;
      }

      if (x < minX) {
        minX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { ok: false, reason: "no_content_detected" };
  }

  const rawBounds: ContentBounds = {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };

  const rawContentAreaRatio =
    (rawBounds.width * rawBounds.height) / (width * height);

  if (rawContentAreaRatio < MIN_DETECTED_CONTENT_AREA_RATIO) {
    return { ok: false, reason: "content_area_too_small" };
  }

  if (rawContentAreaRatio >= ALREADY_TIGHT_CONTENT_RATIO) {
    return { ok: false, reason: "already_tight" };
  }

  const bounds = expandBoundsWithSafetyMargin(rawBounds, width, height);
  const trimmedAreaRatio = (bounds.width * bounds.height) / (width * height);
  const removedAreaRatio = 1 - trimmedAreaRatio;
  const widthCoverageRatio = rawBounds.width / width;
  const heightCoverageRatio = rawBounds.height / height;
  const isVerticalWhitespaceTrim =
    widthCoverageRatio >= MIN_WIDTH_COVERAGE_FOR_VERTICAL_WHITESPACE_TRIM &&
    heightCoverageRatio <= MAX_HEIGHT_COVERAGE_FOR_VERTICAL_WHITESPACE_TRIM;

  if (removedAreaRatio < MIN_USEFUL_TRIM_AREA_SAVINGS) {
    return { ok: false, reason: "trim_too_small" };
  }

  if (removedAreaRatio > MAX_REMOVABLE_AREA_RATIO && !isVerticalWhitespaceTrim) {
    return { ok: false, reason: "trim_too_aggressive" };
  }

  if (
    countRiskyEdgeTouches(rawBounds, width, height) > MAX_RISKY_EDGE_TOUCH_SIDES
  ) {
    return { ok: false, reason: "content_touches_edges" };
  }

  return {
    ok: true,
    bounds,
    contentAreaRatio: trimmedAreaRatio,
  };
}
