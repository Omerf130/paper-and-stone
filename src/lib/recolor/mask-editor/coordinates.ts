export type NaturalPoint = { x: number; y: number };
export type DisplayPoint = { x: number; y: number };

export type NaturalDimensions = { width: number; height: number };
export type ContainerDimensions = { width: number; height: number };

export type DisplayTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
};

import type { ZoomModeIndex } from "./constants";

export function computeDisplayTransform(
  natural: NaturalDimensions,
  container: ContainerDimensions,
  zoomMode: ZoomModeIndex,
): DisplayTransform {
  const fitScale = Math.min(
    container.width / natural.width,
    container.height / natural.height,
  );

  let scale: number;
  switch (zoomMode) {
    case 0:
      scale = fitScale;
      break;
    case 1:
      scale = 1;
      break;
    case 2:
      scale = 1.5;
      break;
    case 3:
      scale = 2;
      break;
    default:
      scale = fitScale;
  }

  const displayWidth = natural.width * scale;
  const displayHeight = natural.height * scale;
  const offsetX = Math.max(0, (container.width - displayWidth) / 2);
  const offsetY = Math.max(0, (container.height - displayHeight) / 2);

  return {
    scale,
    offsetX,
    offsetY,
    displayWidth,
    displayHeight,
  };
}

export function computeFitTransform(
  natural: NaturalDimensions,
  container: ContainerDimensions,
  zoomMultiplier: number,
): DisplayTransform {
  const fitScale = Math.min(
    container.width / natural.width,
    container.height / natural.height,
  );
  const scale = fitScale * zoomMultiplier;
  const displayWidth = natural.width * scale;
  const displayHeight = natural.height * scale;
  const offsetX = (container.width - displayWidth) / 2;
  const offsetY = (container.height - displayHeight) / 2;

  return {
    scale,
    offsetX,
    offsetY,
    displayWidth,
    displayHeight,
  };
}

export function displayToNatural(
  point: DisplayPoint,
  transform: DisplayTransform,
  natural: NaturalDimensions,
): NaturalPoint {
  const xDisp = point.x - transform.offsetX;
  const yDisp = point.y - transform.offsetY;

  const xNat = xDisp / transform.scale;
  const yNat = yDisp / transform.scale;

  return {
    x: clamp(xNat, 0, natural.width - 1),
    y: clamp(yNat, 0, natural.height - 1),
  };
}

export function naturalToDisplay(
  point: NaturalPoint,
  transform: DisplayTransform,
): DisplayPoint {
  return {
    x: point.x * transform.scale + transform.offsetX,
    y: point.y * transform.scale + transform.offsetY,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
