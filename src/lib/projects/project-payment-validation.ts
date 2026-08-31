import { z } from "zod";
import { parseShekelsInputToAgorot } from "@/lib/money/parse-money-input";
import {
  PROJECT_PAYMENT_ERRORS,
  PROJECT_PAYMENT_METHODS,
  type ProjectPaymentInput,
  type ProjectPaymentUpdateInput,
} from "@/types/project-payment";

const paymentNoteSchema = z
  .string()
  .trim()
  .max(500, PROJECT_PAYMENT_ERRORS.NOTE_TOO_LONG)
  .optional()
  .or(z.literal(""));

const projectPaymentBaseSchema = z.object({
  projectId: z.string().min(1),
  amountShekels: z.string().min(1, PROJECT_PAYMENT_ERRORS.AMOUNT_REQUIRED),
  paymentDate: z.string().min(1, PROJECT_PAYMENT_ERRORS.DATE_REQUIRED),
  paymentMethod: z.enum(PROJECT_PAYMENT_METHODS, {
    message: PROJECT_PAYMENT_ERRORS.METHOD_INVALID,
  }),
  note: paymentNoteSchema,
});

function parsePaymentDate(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function parseAmountAgorot(amountShekels: string): number | null {
  const agorot = parseShekelsInputToAgorot(amountShekels);
  if (agorot == null || agorot <= 0) {
    return null;
  }
  return agorot;
}

export function parseProjectPaymentInput(input: ProjectPaymentInput):
  | {
      success: true;
      data: {
        projectId: string;
        amountAgorot: number;
        paymentDate: Date;
        paymentMethod: ProjectPaymentInput["paymentMethod"];
        note?: string;
      };
    }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = projectPaymentBaseSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  const amountAgorot = parseAmountAgorot(parsed.data.amountShekels);
  if (amountAgorot == null) {
    return {
      success: false,
      fieldErrors: { amountShekels: PROJECT_PAYMENT_ERRORS.AMOUNT_MUST_BE_POSITIVE },
    };
  }

  const paymentDate = parsePaymentDate(parsed.data.paymentDate);
  if (!paymentDate) {
    return {
      success: false,
      fieldErrors: { paymentDate: PROJECT_PAYMENT_ERRORS.DATE_INVALID },
    };
  }

  const note = parsed.data.note?.trim();

  return {
    success: true,
    data: {
      projectId: parsed.data.projectId,
      amountAgorot,
      paymentDate,
      paymentMethod: parsed.data.paymentMethod,
      note: note || undefined,
    },
  };
}

export function parseProjectPaymentUpdateInput(input: ProjectPaymentUpdateInput):
  | {
      success: true;
      data: {
        paymentId: string;
        projectId: string;
        amountAgorot: number;
        paymentDate: Date;
        paymentMethod: ProjectPaymentInput["paymentMethod"];
        note?: string;
      };
    }
  | { success: false; fieldErrors: Record<string, string> } {
  if (!input.paymentId?.trim()) {
    return {
      success: false,
      fieldErrors: { paymentId: PROJECT_PAYMENT_ERRORS.NOT_FOUND },
    };
  }

  const parsed = parseProjectPaymentInput(input);
  if (!parsed.success) {
    return parsed;
  }

  return {
    success: true,
    data: {
      paymentId: input.paymentId,
      ...parsed.data,
    },
  };
}
