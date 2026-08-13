"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { QuoteMutationError, QUOTE_ERRORS } from "@/lib/quotes/quote-errors";
import {
  saveQuoteDraft,
  sendProjectQuote,
} from "@/lib/quotes/quote-mutations";
import {
  parseQuotePricingValues,
  parseSaveQuoteDraftInput,
  parseSendQuoteInput,
} from "@/lib/quotes/quote-validation";
import type { QuoteActionState } from "@/types/project-quote";

export async function saveQuoteDraftAction(
  input: Parameters<typeof parseSaveQuoteDraftInput>[0],
): Promise<QuoteActionState> {
  await requireAdmin();

  const parsed = parseSaveQuoteDraftInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const pricing = parseQuotePricingValues(parsed.data);
  if ("fieldErrors" in pricing) {
    return { fieldErrors: pricing.fieldErrors };
  }

  try {
    const user = await requireAdmin();
    await saveQuoteDraft(user.id, parsed.data, pricing);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof QuoteMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: QUOTE_ERRORS.GENERIC };
  }
}

export async function sendProjectQuoteAction(
  input: Parameters<typeof parseSendQuoteInput>[0],
): Promise<QuoteActionState> {
  await requireAdmin();

  const parsed = parseSendQuoteInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const pricing = parseQuotePricingValues(parsed.data);
  if ("fieldErrors" in pricing) {
    return { fieldErrors: pricing.fieldErrors };
  }

  try {
    const user = await requireAdmin();
    await sendProjectQuote(user.id, parsed.data, pricing);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    revalidatePath("/professional");
    revalidatePath(`/professional/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof QuoteMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: QUOTE_ERRORS.GENERIC };
  }
}
