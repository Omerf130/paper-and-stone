import type { NaturalPoint } from "./coordinates";

export type BrushMode = "paint" | "erase";

export function applyBrushDab(
  maskData: ImageData,
  center: NaturalPoint,
  radius: number,
  mode: BrushMode,
): boolean {
  const { width, height, data } = maskData;
  const radiusSq = radius * radius;
  const minX = Math.max(0, Math.floor(center.x - radius));
  const maxX = Math.min(width - 1, Math.ceil(center.x + radius));
  const minY = Math.max(0, Math.floor(center.y - radius));
  const maxY = Math.min(height - 1, Math.ceil(center.y + radius));

  let changed = false;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - center.x;
      const dy = y - center.y;
      if (dx * dx + dy * dy > radiusSq) {
        continue;
      }

      const index = (y * width + x) * 4;

      if (mode === "paint") {
        if (
          data[index] !== 255 ||
          data[index + 1] !== 255 ||
          data[index + 2] !== 255 ||
          data[index + 3] !== 255
        ) {
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
          data[index + 3] = 255;
          changed = true;
        }
      } else if (data[index + 3] !== 0) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 0;
        changed = true;
      }
    }
  }

  return changed;
}

export function applyBrushStroke(
  maskData: ImageData,
  from: NaturalPoint,
  to: NaturalPoint,
  radius: number,
  mode: BrushMode,
): boolean {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / (radius * 0.5)));
  let changed = false;

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const point = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
    if (applyBrushDab(maskData, point, radius, mode)) {
      changed = true;
    }
  }

  return changed;
}
