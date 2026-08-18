export const MAX_MARKUP_BASIS_POINTS = 100_000; // 1000%

export function percentageStringToBasisPoints(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
    return null;
  }

  return Math.round(parsed * 100);
}

export function basisPointsToPercentageString(basisPoints: number): string {
  const percentage = basisPoints / 100;
  return Number.isInteger(percentage)
    ? String(percentage)
    : percentage.toFixed(2).replace(/\.?0+$/, "");
}

export function isValidMarkupBasisPoints(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_MARKUP_BASIS_POINTS
  );
}
