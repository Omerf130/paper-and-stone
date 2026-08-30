import {
  analyzeImageContentBounds,
  expandBoundsWithPadding,
} from "@/lib/media/image-content-bounds";

export type {
  ImageContentBounds,
  NormalizationDecision,
} from "@/lib/media/image-content-bounds";
export {
  analyzeImageContentBounds,
  DEFAULT_PADDING_RATIO,
  evaluateProductImageNormalization,
  expandBoundsWithPadding,
  getContentAreaRatio,
  WELL_FRAMED_CONTENT_AREA_RATIO,
} from "@/lib/media/image-content-bounds";

export type CroppedImageResult = {
  blobUrl: string;
  width: number;
  height: number;
};

function loadCrossOriginImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = url;
  });
}

export async function cropImageUrlToContent(
  url: string,
  paddingRatio = 0.025,
): Promise<CroppedImageResult | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const image = await loadCrossOriginImage(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = width;
    sampleCanvas.height = height;

    const sampleContext = sampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!sampleContext) {
      return null;
    }

    sampleContext.drawImage(image, 0, 0);
    const sampleData = sampleContext.getImageData(0, 0, width, height);
    const bounds = expandBoundsWithPadding(
      analyzeImageContentBounds(sampleData.data, width, height),
      width,
      height,
      paddingRatio,
    );

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = bounds.contentWidth;
    cropCanvas.height = bounds.contentHeight;

    const cropContext = cropCanvas.getContext("2d");
    if (!cropContext) {
      return null;
    }

    cropContext.drawImage(
      image,
      bounds.minX,
      bounds.minY,
      bounds.contentWidth,
      bounds.contentHeight,
      0,
      0,
      bounds.contentWidth,
      bounds.contentHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      cropCanvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      return null;
    }

    return {
      blobUrl: URL.createObjectURL(blob),
      width: bounds.contentWidth,
      height: bounds.contentHeight,
    };
  } catch {
    return null;
  }
}

export function drawCroppedImageDataToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  paddingRatio = 0.025,
): void {
  const { width, height, data } = imageData;
  const bounds = expandBoundsWithPadding(
    analyzeImageContentBounds(data, width, height),
    width,
    height,
    paddingRatio,
  );

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas unsupported");
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) {
    throw new Error("Canvas unsupported");
  }

  sourceContext.putImageData(imageData, 0, 0);
  canvas.width = bounds.contentWidth;
  canvas.height = bounds.contentHeight;
  context.clearRect(0, 0, bounds.contentWidth, bounds.contentHeight);
  context.drawImage(
    sourceCanvas,
    bounds.minX,
    bounds.minY,
    bounds.contentWidth,
    bounds.contentHeight,
    0,
    0,
    bounds.contentWidth,
    bounds.contentHeight,
  );
}
