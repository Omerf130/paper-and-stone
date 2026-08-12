import { z } from "zod";
import type {
  AddToProjectInput,
  ProjectFormInput,
  UpdateProjectItemInput,
} from "@/types/project";

export const MAX_PROJECT_ITEM_QUANTITY = 999;

export const PROJECT_ERRORS = {
  GENERIC: "אירעה שגיאה בשמירת הפרויקט. נסו שוב.",
  NOT_FOUND: "הפרויקט לא נמצא.",
  NOT_EDITABLE: "לא ניתן לערוך פרויקט זה.",
  PROFILE_NOT_READY:
    "יש להשלים שם מלא וטלפון בפרופיל לפני ניהול פרויקטים.",
  QUANTITY_EXCEEDS_MAX: "הכמות המרבית לפריט היא 999.",
  INVALID_PRODUCT: "המוצר אינו זמין.",
  INVALID_SELECTION: "הבחירה אינה תקינה עבור מוצר זה.",
} as const;

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

export const projectFormInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "נא להזין שם פרויקט")
    .max(120, "שם הפרויקט ארוך מדי"),
  clientName: optionalTrimmedString(120),
  location: optionalTrimmedString(120),
  description: optionalTrimmedString(1000),
});

export type ProjectWriteFields = {
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
};

const objectIdString = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "מזהה לא תקין");

const quantitySchema = z
  .number()
  .int("הכמות חייבת להיות מספר שלם")
  .min(1, "הכמות המינימלית היא 1")
  .max(
    MAX_PROJECT_ITEM_QUANTITY,
    `הכמות המרבית היא ${MAX_PROJECT_ITEM_QUANTITY}`,
  );

export const addToProjectInputSchema = z.object({
  projectId: objectIdString,
  productSlug: z.string().trim().min(1).max(200),
  selectedMaterialId: z.string().min(1).optional(),
  selectedColorId: z.string().min(1).optional(),
  selectedSizeKey: z.string().min(1).optional(),
  quantity: quantitySchema,
});

export const updateProjectItemInputSchema = z.object({
  projectId: objectIdString,
  itemId: objectIdString,
  selectedMaterialId: z.string().min(1).optional(),
  selectedColorId: z.string().min(1).optional(),
  selectedSizeKey: z.string().min(1).optional(),
  quantity: quantitySchema,
});

function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export function parseProjectFormInput(
  input: ProjectFormInput,
):
  | { success: true; data: ProjectWriteFields }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = projectFormInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseAddToProjectInput(
  input: AddToProjectInput,
):
  | { success: true; data: AddToProjectInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = addToProjectInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseUpdateProjectItemInput(
  input: UpdateProjectItemInput,
):
  | { success: true; data: UpdateProjectItemInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = updateProjectItemInputSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, fieldErrors: formatZodErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}
