export function multiplyUnitPriceAgorot(
  unitPriceAgorot: number,
  quantity: number,
): number {
  return unitPriceAgorot * quantity;
}

export function sumAgorot(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function calculateVatFromTaxableBase(
  taxableBaseAgorot: number,
  vatRateBasisPoints: number,
): number {
  return Math.round((taxableBaseAgorot * vatRateBasisPoints) / 10000);
}
