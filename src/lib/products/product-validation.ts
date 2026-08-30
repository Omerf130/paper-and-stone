import { z } from "zod";
import { normalizeProductSku } from "@/lib/products/normalize-product-sku";
import { parseInternalCostInput } from "@/lib/pricing/pricing-validation";
import type { AdminProductFormInput } from "@/types/admin-product";

export const PRODUCT_ERRORS = {
  DUPLICATE_SLUG: "כבר קיים מוצר עם כתובת זו",
  DUPLICATE_SKU: "קוד המוצר כבר קיים במערכת",
  INVALID_CATEGORY: "הקטגוריה שנבחרה אינה תקינה",
  INVALID_SUPPLIER: "הספק שנבחר אינו תקין",
  SUPPLIER_REQUIRED: "נא לבחור ספק",
  GENERIC: "אירעה שגיאה בשמירת המוצר. נסו שוב.",
} as const;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

const positiveOptionalNumber = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => value === undefined || value === "" || Number(value) > 0,
    "יש להזין מספר חיובי",
  );

const objectIdString = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, "מזהה לא תקין");

const productMaterialOptionSchema = z.object({
  materialId: objectIdString,
  allowedColorIds: z.array(objectIdString).min(1, "יש לבחור לפחות צבע אחד"),
});

const productSizeSchema = z.object({
  key: z.string().min(1).max(64),
  label: z.string().min(1, "נא להזין תווית מידה").max(100),
});

const productDocumentSchema = z.object({
  label: z.string().min(1, "נא להזין שם מסמך").max(120),
  url: z
    .string()
    .min(1, "נא להזין כתובת")
    .max(2048)
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "כתובת המסמך חייבת להתחיל ב-http:// או https://",
    ),
  fileType: optionalString(32),
});

export const productInputSchema = z
  .object({
    nameHe: z.string().min(1, "נא להזין שם בעברית").max(200),
    nameEn: optionalString(200),
    slug: z
      .string()
      .min(1, "נא להזין כתובת")
      .max(100)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "כתובת חייבת להכיל אותיות קטנות, מספרים ומקפים בלבד",
      ),
    sku: z.string().min(1, "נא להזין קוד מוצר").max(50),
    categoryId: z.string().min(1, "נא לבחור קטגוריה"),
    supplierId: z.string().min(1, PRODUCT_ERRORS.SUPPLIER_REQUIRED),
    internalCatalogName: optionalString(200),
    catalogCode: optionalString(100),
    brand: optionalString(120),
    designer: optionalString(120),
    shortDescription: optionalString(500),
    longDescription: optionalString(5000),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    width: positiveOptionalNumber,
    depth: positiveOptionalNumber,
    height: positiveOptionalNumber,
    seatHeight: positiveOptionalNumber,
    materials: z.array(z.string().min(1).max(120)),
    maintenance: optionalString(1000),
    warranty: optionalString(1000),
    countryOfOrigin: optionalString(120),
    materialOptions: z.array(productMaterialOptionSchema),
    sizes: z.array(productSizeSchema),
    documents: z.array(productDocumentSchema),
    defaultInternalCostShekels: z.string().optional().or(z.literal("")),
  })
  .superRefine((value, context) => {
    const seenMaterialIds = new Set<string>();

    for (const [index, option] of value.materialOptions.entries()) {
      if (seenMaterialIds.has(option.materialId)) {
        context.addIssue({
          code: "custom",
          message: "לא ניתן לבחור את אותו חומר פעמיים",
          path: ["materialOptions", index, "materialId"],
        });
      } else {
        seenMaterialIds.add(option.materialId);
      }

      const seenColorIds = new Set<string>();
      for (const colorId of option.allowedColorIds) {
        if (seenColorIds.has(colorId)) {
          context.addIssue({
            code: "custom",
            message: "לא ניתן לבחור את אותו צבע פעמיים",
            path: ["materialOptions", index, "allowedColorIds"],
          });
          break;
        }
        seenColorIds.add(colorId);
      }
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductWriteFields = {
  nameHe: string;
  nameEn?: string;
  slug: string;
  sku: string;
  skuNormalized: string;
  categoryId: string;
  supplierId: string;
  internalCatalogName?: string;
  catalogCode?: string;
  brand?: string;
  designer?: string;
  shortDescription?: string;
  longDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  width?: number;
  depth?: number;
  height?: number;
  seatHeight?: number;
  materials: string[];
  maintenance?: string;
  warranty?: string;
  countryOfOrigin?: string;
  materialOptions: ProductInput["materialOptions"];
  sizes: ProductInput["sizes"];
  documents: Array<{
    label: string;
    url: string;
    fileType?: string;
    sortOrder: number;
  }>;
  defaultInternalCostAgorot?: number;
};

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapProductInputToWriteFields(
  input: ProductInput,
): ProductWriteFields {
  return {
    nameHe: input.nameHe.trim(),
    nameEn: emptyToUndefined(input.nameEn),
    slug: input.slug.trim(),
    sku: input.sku.trim(),
    skuNormalized: normalizeProductSku(input.sku),
    categoryId: input.categoryId,
    supplierId: input.supplierId,
    internalCatalogName: emptyToUndefined(input.internalCatalogName),
    catalogCode: emptyToUndefined(input.catalogCode),
    brand: emptyToUndefined(input.brand),
    designer: emptyToUndefined(input.designer),
    shortDescription: emptyToUndefined(input.shortDescription),
    longDescription: emptyToUndefined(input.longDescription),
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    width: parseOptionalNumber(input.width),
    depth: parseOptionalNumber(input.depth),
    height: parseOptionalNumber(input.height),
    seatHeight: parseOptionalNumber(input.seatHeight),
    materials: input.materials.map((item) => item.trim()).filter(Boolean),
    maintenance: emptyToUndefined(input.maintenance),
    warranty: emptyToUndefined(input.warranty),
    countryOfOrigin: emptyToUndefined(input.countryOfOrigin),
    materialOptions: input.materialOptions,
    sizes: input.sizes,
    documents: input.documents.map((document, index) => ({
      label: document.label.trim(),
      url: document.url.trim(),
      fileType: emptyToUndefined(document.fileType),
      sortOrder: index,
    })),
    defaultInternalCostAgorot: input.defaultInternalCostShekels
      ? parseInternalCostInput(input.defaultInternalCostShekels) ?? undefined
      : undefined,
  };
}

export function formatProductZodErrors(
  error: z.ZodError,
): { fieldErrors: Record<string, string>; error?: string } {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors };
}

export function parseProductFormInput(
  input: AdminProductFormInput,
):
  | { success: true; data: ProductInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = productInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatProductZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}

export function isDuplicateKeyError(
  error: unknown,
): "slug" | "sku" | "skuNormalized" | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000 &&
    "keyPattern" in error &&
    typeof error.keyPattern === "object" &&
    error.keyPattern !== null
  ) {
    const keyPattern = error.keyPattern as Record<string, unknown>;
    if ("slug" in keyPattern) {
      return "slug";
    }
    if ("sku" in keyPattern || "skuNormalized" in keyPattern) {
      return "sku";
    }
  }

  return null;
}
