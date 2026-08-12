export function maskHasContent(maskData: ImageData): boolean {
  for (let i = 3; i < maskData.data.length; i += 4) {
    if (maskData.data[i] > 0) {
      return true;
    }
  }
  return false;
}

export function maskHasContentFromAlpha(alpha: Uint8Array): boolean {
  for (let i = 0; i < alpha.length; i += 1) {
    if (alpha[i] > 0) {
      return true;
    }
  }
  return false;
}

export function buildExportImageData(maskData: ImageData): ImageData {
  const exported = new ImageData(maskData.width, maskData.height);
  const { data } = maskData;
  const out = exported.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
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

  return exported;
}

export async function exportMaskToPngBlob(
  maskData: ImageData,
): Promise<Blob> {
  const exported = buildExportImageData(maskData);

  if (typeof document === "undefined") {
    throw new Error("exportMaskToPngBlob requires a browser environment");
  }

  const canvas = document.createElement("canvas");
  canvas.width = exported.width;
  canvas.height = exported.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas unsupported");
  }

  context.putImageData(exported, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Failed to export mask PNG");
  }

  return blob;
}

export function exportMaskToFile(
  maskData: ImageData,
  filename = "recolor-mask.png",
): Promise<File> {
  return exportMaskToPngBlob(maskData).then(
    (blob) => new File([blob], filename, { type: "image/png" }),
  );
}
