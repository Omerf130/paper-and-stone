import {
  getMaskStrength,
  hexToRgb,
  hslToRgb,
  rgbToHsl,
} from "./color-space";

export function applyLuminancePreservingRecolor(
  sourceData: ImageData,
  maskData: ImageData,
  targetHex: string,
): ImageData {
  const output = new ImageData(sourceData.width, sourceData.height);
  const [targetR, targetG, targetB] = hexToRgb(targetHex);
  const [, targetS] = rgbToHsl(targetR, targetG, targetB);
  const targetHue = rgbToHsl(targetR, targetG, targetB)[0];

  for (let index = 0; index < sourceData.data.length; index += 4) {
    const sr = sourceData.data[index];
    const sg = sourceData.data[index + 1];
    const sb = sourceData.data[index + 2];
    const sa = sourceData.data[index + 3];

    const mr = maskData.data[index];
    const mg = maskData.data[index + 1];
    const mb = maskData.data[index + 2];
    const ma = maskData.data[index + 3];

    const strength = getMaskStrength(mr, mg, mb, ma);

    if (strength <= 0) {
      output.data[index] = sr;
      output.data[index + 1] = sg;
      output.data[index + 2] = sb;
      output.data[index + 3] = sa;
      continue;
    }

    const [, , originalLightness] = rgbToHsl(sr, sg, sb);
    const [rr, rg, rb] = hslToRgb(targetHue, targetS, originalLightness);

    output.data[index] = Math.round(sr + (rr - sr) * strength);
    output.data[index + 1] = Math.round(sg + (rg - sg) * strength);
    output.data[index + 2] = Math.round(sb + (rb - sb) * strength);
    output.data[index + 3] = sa;
  }

  return output;
}

export function imageDimensionsMatch(
  sourceWidth: number,
  sourceHeight: number,
  maskWidth: number,
  maskHeight: number,
): boolean {
  return sourceWidth === maskWidth && sourceHeight === maskHeight;
}
