import { OVERLAY_COLOR } from "./constants";
import type { DisplayTransform } from "./coordinates";

export function renderMaskOverlay(
  maskData: ImageData,
  width: number,
  height: number,
): ImageData {
  const overlay = new ImageData(width, height);
  const src = maskData.data;
  const out = overlay.data;
  const { r, g, b, a } = OVERLAY_COLOR;
  const alphaByte = Math.round(a * 255);

  for (let i = 0; i < src.length; i += 4) {
    if (src[i + 3] > 0) {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = alphaByte;
    }
  }

  return overlay;
}

export function drawCompositeToDisplay(
  displayContext: CanvasRenderingContext2D,
  transform: DisplayTransform,
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  showOverlay: boolean,
): void {
  const { displayWidth, displayHeight, offsetX, offsetY } = transform;
  const canvas = displayContext.canvas;

  displayContext.clearRect(0, 0, canvas.width, canvas.height);
  displayContext.drawImage(
    sourceCanvas,
    offsetX,
    offsetY,
    displayWidth,
    displayHeight,
  );

  if (!showOverlay) {
    return;
  }

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = maskCanvas.width;
  overlayCanvas.height = maskCanvas.height;

  const overlayContext = overlayCanvas.getContext("2d");
  if (!overlayContext) {
    return;
  }

  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskContext) {
    return;
  }

  const maskData = maskContext.getImageData(
    0,
    0,
    maskCanvas.width,
    maskCanvas.height,
  );
  const overlayData = renderMaskOverlay(
    maskData,
    maskCanvas.width,
    maskCanvas.height,
  );
  overlayContext.putImageData(overlayData, 0, 0);

  displayContext.drawImage(
    overlayCanvas,
    offsetX,
    offsetY,
    displayWidth,
    displayHeight,
  );
}
