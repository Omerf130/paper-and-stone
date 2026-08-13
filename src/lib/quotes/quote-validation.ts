import { z } from "zod";
import { parseShekelsInputToAgorot } from "@/lib/money/parse-money-input";
import { QUOTE_ERRORS } from "@/lib/quotes/quote-errors";

export const QUOTE_GENERAL_NOTE_MAX = 2000;
export const QUOTE_LINE_NOTE_MAX = 500;
export const QUOTE_CHANGE_MESSAGE_MAX = 2000;
export const QUOTE_ADDITIONAL_LABEL_MAX = 120;
export const MAX_ADDITIONAL_LINES = 20;

const objectIdString = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "מזהה לא תקין");

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });

const quoteItemLineInputSchema = z.object({
  projectItemId: objectIdString,
  unitPriceShekels: z.string().trim().min(1, QUOTE_ERRORS.UNIT_PRICE_REQUIRED),
  adminNote: optionalTrimmedString(QUOTE_LINE_NOTE_MAX),
});

const quoteAdditionalLineInputSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "יש להזין תיאור לשורה")
    .max(QUOTE_ADDITIONAL_LABEL_MAX, "התיאור ארוך מדי"),
  amountShekels: z.string().trim().min(1, "יש להזין סכום"),
});

export const saveQuoteDraftInputSchema = z.object({
  projectId: objectIdString,
  itemLines: z.array(quoteItemLineInputSchema).min(1),
  additionalLines: z
    .array(quoteAdditionalLineInputSchema)
    .max(MAX_ADDITIONAL_LINES),
  generalNote: optionalTrimmedString(QUOTE_GENERAL_NOTE_MAX),
  validUntil: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
});

export const sendQuoteInputSchema = saveQuoteDraftInputSchema;

export const acceptQuoteInputSchema = z.object({
  quoteId: objectIdString,
});

export const requestQuoteChangeInputSchema = z.object({
  quoteId: objectIdString,
  message: z
    .string()
    .trim()
    .min(1, QUOTE_ERRORS.CHANGE_MESSAGE_REQUIRED)
    .max(QUOTE_CHANGE_MESSAGE_MAX, "ההודעה ארוכה מדי"),
});

export type ParsedSaveQuoteDraftInput = z.infer<typeof saveQuoteDraftInputSchema>;
export type ParsedRequestQuoteChangeInput = z.infer<
  typeof requestQuoteChangeInputSchema
>;

function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "form";
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export function parseSaveQuoteDraftInput(
  input: z.input<typeof saveQuoteDraftInputSchema>,
):
  | { success: true; data: ParsedSaveQuoteDraftInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = saveQuoteDraftInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseSendQuoteInput(
  input: z.input<typeof sendQuoteInputSchema>,
):
  | { success: true; data: ParsedSaveQuoteDraftInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = sendQuoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseAcceptQuoteInput(
  quoteId: string,
):
  | { success: true; data: { quoteId: string } }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = acceptQuoteInputSchema.safeParse({ quoteId });

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseRequestQuoteChangeInput(
  input: z.input<typeof requestQuoteChangeInputSchema>,
):
  | { success: true; data: ParsedRequestQuoteChangeInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = requestQuoteChangeInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export type ParsedQuotePricingInput = {
  itemLines: Array<{
    projectItemId: string;
    unitPriceAgorot: number;
    adminNote?: string;
  }>;
  additionalLines: Array<{
    label: string;
    amountAgorot: number;
  }>;
  generalNote?: string;
  validUntil?: Date;
};

export function parseQuotePricingValues(
  input: ParsedSaveQuoteDraftInput,
): ParsedQuotePricingInput | { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const itemLines: ParsedQuotePricingInput["itemLines"] = [];

  for (const [index, line] of input.itemLines.entries()) {
    const unitPriceAgorot = parseShekelsInputToAgorot(line.unitPriceShekels);

    if (unitPriceAgorot === null || unitPriceAgorot < 0) {
      fieldErrors[`itemLines.${index}.unitPriceShekels`] =
        "יש להזין מחיר תקין";
      continue;
    }

    itemLines.push({
      projectItemId: line.projectItemId,
      unitPriceAgorot,
      adminNote: line.adminNote,
    });
  }

  const additionalLines: ParsedQuotePricingInput["additionalLines"] = [];

  for (const [index, line] of input.additionalLines.entries()) {
    const amountAgorot = parseShekelsInputToAgorot(line.amountShekels);

    if (amountAgorot === null) {
      fieldErrors[`additionalLines.${index}.amountShekels`] =
        "יש להזין סכום תקין";
      continue;
    }

    additionalLines.push({
      label: line.label,
      amountAgorot,
    });
  }

  let validUntil: Date | undefined;
  if (input.validUntil) {
    const parsedDate = new Date(input.validUntil);
    if (Number.isNaN(parsedDate.getTime())) {
      fieldErrors.validUntil = "תאריך לא תקין";
    } else {
      validUntil = parsedDate;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    itemLines,
    additionalLines,
    generalNote: input.generalNote,
    validUntil,
  };
}
