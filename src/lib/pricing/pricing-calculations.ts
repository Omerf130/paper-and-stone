import { multiplyUnitPriceAgorot, sumAgorot } from "@/lib/money/agorot-math";

export function applyMarkupBp(
  baseAgorot: number,
  markupBp: number,
): number {
  return Math.round((baseAgorot * (10_000 + markupBp)) / 10_000);
}

/** @deprecated Pricing V1 — forward admin layer markup on internal cost */
export function calculateArchitectPriceAgorot(
  internalCostAgorot: number,
  adminMarkupBp: number,
): number {
  return applyMarkupBp(internalCostAgorot, adminMarkupBp);
}

/** @deprecated Pricing V1 — forward architect markup on architect price */
export function calculateClientPriceAgorot(
  architectPriceAgorot: number,
  architectMarkupBp: number,
): number {
  return applyMarkupBp(architectPriceAgorot, architectMarkupBp);
}

/** @deprecated intermediate V2 — architect profit from architect base × markup */
export function calculateArchitectProfitAgorot(
  architectPriceAgorot: number,
  architectMarkupBp: number,
): number {
  return Math.round((architectPriceAgorot * architectMarkupBp) / 10_000);
}

/** @deprecated intermediate V2 — client price from architect base + markup */
export function calculateClientPriceFromArchitectMarkup(
  architectPriceAgorot: number,
  architectMarkupBp: number,
): number {
  return architectPriceAgorot + calculateArchitectProfitAgorot(
    architectPriceAgorot,
    architectMarkupBp,
  );
}

/** @deprecated intermediate V2 — P&S profit from architect base minus internal cost */
export function calculatePaperStoneProfitFromArchitectBase(
  internalCostAgorot: number,
  architectPriceAgorot: number,
): number {
  return architectPriceAgorot - internalCostAgorot;
}

/** Commercial margin = final client price minus product/internal cost. */
export function calculateCommercialMarginAgorot(
  internalCostAgorot: number,
  clientPriceAgorot: number,
): number {
  return clientPriceAgorot - internalCostAgorot;
}

/** Architect profit = share of commercial margin (basis points). */
export function calculateArchitectProfitFromMarginShare(
  commercialMarginAgorot: number,
  architectMarkupBp: number,
): number {
  return Math.round((commercialMarginAgorot * architectMarkupBp) / 10_000);
}

/** Paper & Stone profit = remaining commercial margin after architect share. */
export function calculatePaperStoneProfitFromMarginShare(
  commercialMarginAgorot: number,
  architectProfitAgorot: number,
): number {
  return commercialMarginAgorot - architectProfitAgorot;
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
