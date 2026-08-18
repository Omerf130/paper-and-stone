import { multiplyUnitPriceAgorot, sumAgorot } from "@/lib/money/agorot-math";

export function applyMarkupBp(
  baseAgorot: number,
  markupBp: number,
): number {
  return Math.round((baseAgorot * (10_000 + markupBp)) / 10_000);
}

export function calculateArchitectPriceAgorot(
  internalCostAgorot: number,
  adminMarkupBp: number,
): number {
  return applyMarkupBp(internalCostAgorot, adminMarkupBp);
}

export function calculateClientPriceAgorot(
  architectPriceAgorot: number,
  architectMarkupBp: number,
): number {
  return applyMarkupBp(architectPriceAgorot, architectMarkupBp);
}

export function calculateLineTotalAgorot(
  unitPriceAgorot: number,
  quantity: number,
): number {
  return multiplyUnitPriceAgorot(unitPriceAgorot, quantity);
}

export function sumLineTotalsAgorot(lineTotals: number[]): number {
  return sumAgorot(lineTotals);
}
