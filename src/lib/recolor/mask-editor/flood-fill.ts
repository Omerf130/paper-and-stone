import type { NaturalPoint } from "./coordinates";
import type { BrushMode } from "./brush";

export function floodFillMask(
  maskData: ImageData,
  start: NaturalPoint,
  mode: BrushMode,
): boolean {
  const { width, height, data } = maskData;
  const startX = Math.floor(start.x);
  const startY = Math.floor(start.y);

  if (startX < 0 || startY < 0 || startX >= width || startY >= height) {
    return false;
  }

  const targetPainted = mode === "erase";
  const startIndex = (startY * width + startX) * 4;
  const startPainted = data[startIndex + 3] > 0;

  if (startPainted === !targetPainted) {
    return false;
  }

  const stack: number[] = [startX, startY];
  const visited = new Uint8Array(width * height);
  let changed = false;

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const pixelIndex = y * width + x;

    if (visited[pixelIndex]) {
      continue;
    }
    visited[pixelIndex] = 1;

    const dataIndex = pixelIndex * 4;
    const isPainted = data[dataIndex + 3] > 0;

    if (isPainted !== targetPainted) {
      continue;
    }

    if (mode === "paint") {
      data[dataIndex] = 255;
      data[dataIndex + 1] = 255;
      data[dataIndex + 2] = 255;
      data[dataIndex + 3] = 255;
    } else {
      data[dataIndex] = 0;
      data[dataIndex + 1] = 0;
      data[dataIndex + 2] = 0;
      data[dataIndex + 3] = 0;
    }
    changed = true;

    if (x > 0) {
      stack.push(x - 1, y);
    }
    if (x < width - 1) {
      stack.push(x + 1, y);
    }
    if (y > 0) {
      stack.push(x, y - 1);
    }
    if (y < height - 1) {
      stack.push(x, y + 1);
    }
  }

  return changed;
}
