import { getMaskStrength } from "@/lib/recolor/color-space";

export function importMaskFromImageData(source: ImageData): ImageData {
  const { width, height } = source;
  const mask = new ImageData(width, height);
  const src = source.data;
  const out = mask.data;

  for (let i = 0; i < src.length; i += 4) {
    const strength = getMaskStrength(src[i], src[i + 1], src[i + 2], src[i + 3]);

    if (strength > 0) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    } else {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    }
  }

  return mask;
}

export function createEmptyMask(width: number, height: number): ImageData {
  return new ImageData(width, height);
}

export async function loadMaskImageDataFromUrl(
  url: string,
  expectedWidth: number,
  expectedHeight: number,
): Promise<ImageData> {
  if (typeof document === "undefined") {
    throw new Error("loadMaskImageDataFromUrl requires a browser environment");
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load mask image"));
    img.src = url;
  });

  if (
    image.naturalWidth !== expectedWidth ||
    image.naturalHeight !== expectedHeight
  ) {
    throw new Error("Mask dimensions do not match source image");
  }

  const canvas = document.createElement("canvas");
  canvas.width = expectedWidth;
  canvas.height = expectedHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas unsupported");
  }

  context.drawImage(image, 0, 0);
  const raw = context.getImageData(0, 0, expectedWidth, expectedHeight);
  return importMaskFromImageData(raw);
}
