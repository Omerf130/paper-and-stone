import { parseShekelsInputToAgorot } from "@/lib/money/parse-money-input";
import {
  isValidArchitectMarginShareBasisPoints,
  isValidMarkupBasisPoints,
  percentageStringToArchitectMarginShareBasisPoints,
  percentageStringToBasisPoints,
} from "@/lib/pricing/markup-basis-points";

export const PRICING_ERRORS = {
  INVALID_COST: "יש להזין עלות תקינה",
  INVALID_MARKUP: "Markup חייב להיות בין 0% ל־1000%",
  INVALID_ARCHITECT_MARGIN_SHARE: "Markup חייב להיות בין 0% ל־100%",
  NOT_EDITABLE: "לא ניתן לתמחר פרויקט שאינו פעיל",
  ARCHITECT_PRICE_REQUIRED: "יש לקבוע מחיר לאדריכל לפני תמחור ללקוח",
  ARCHITECT_PRICING_READONLY: "תמחור מסחרי נקבע על ידי המנהל בלבד",
  STALE_CLIENT_PRICE: "מחיר הלקוח דורש בדיקה מחדש",
  INCOMPLETE_PRICING: "יש להשלים תמחור לכל המוצרים לפני שליחה",
  PRICING_NEEDS_REVIEW: "יש מוצרים שדורשים בדיקת תמחור מנהל לפני שליחה",
  STALE_PRICING_SUBMIT: "יש מוצרים שדורשים בדיקת תמחור מנהל לפני שליחה",
  ADMIN_PRICING_INCOMPLETE: "יש מוצרים שעדיין לא תומחרו.",
  ADMIN_PRICING_NOT_DELIVERED: "התמחור עוד לא נשלח מהמנהל.",
  ADMIN_PRICING_DELIVERY_CONFLICT:
    "הפרויקט השתנה מאז פתיחת העמוד. יש לרענן ולנסות שוב.",
  VERSION_CONFLICT: "התמחור עודכן במקביל. יש לרענן ולנסות שוב.",
  ITEM_NOT_FOUND: "המוצר לא נמצא בפרויקט",
  PROJECT_NOT_FOUND: "הפרויקט לא נמצא",
  MARKUP_REQUIRED: "לא הוגדר Markup",
  COST_REQUIRED: "לא הוגדרה עלות",
} as const;

export function parseInternalCostInput(value: string): number | null {
  const parsed = parseShekelsInputToAgorot(value);

  if (parsed == null || parsed < 0) {
    return null;
  }

  return parsed;
}

export function parseMarkupPercentageInput(value: string): number | null {
  const basisPoints = percentageStringToBasisPoints(value);

  if (basisPoints == null || !isValidMarkupBasisPoints(basisPoints)) {
    return null;
  }

  return basisPoints;
}

/** Parses architect margin-share markup for Pricing V2 admin forms (0–100%). */
export function parseArchitectMarginShareInput(value: string): number | null {
  const basisPoints = percentageStringToArchitectMarginShareBasisPoints(value);

  if (
    basisPoints == null ||
    !isValidArchitectMarginShareBasisPoints(basisPoints)
  ) {
    return null;
  }

  return basisPoints;
}
