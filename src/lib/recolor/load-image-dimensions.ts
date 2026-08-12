export type ImageDimensions = {
  width: number;
  height: number;
};

export function dimensionsMatch(
  a: ImageDimensions,
  b: ImageDimensions,
): boolean {
  return a.width === b.width && a.height === b.height;
}

export async function loadImageDimensionsFromUrl(
  url: string,
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error("Failed to load image dimensions"));
    };

    image.src = url;
  });
}

export async function loadFileDimensions(file: File): Promise<ImageDimensions> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    return await loadImageDimensionsFromUrl(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function validateMaskDimensionsAgainstPrimary(
  maskFile: File,
  primaryImageUrl: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const [maskDimensions, primaryDimensions] = await Promise.all([
    loadFileDimensions(maskFile),
    loadImageDimensionsFromUrl(primaryImageUrl),
  ]);

  if (!dimensionsMatch(maskDimensions, primaryDimensions)) {
    return {
      ok: false,
      message: `מידות המסכה (${maskDimensions.width}×${maskDimensions.height}) אינן תואמות לתמונה הראשית (${primaryDimensions.width}×${primaryDimensions.height}).`,
    };
  }

  return { ok: true };
}
