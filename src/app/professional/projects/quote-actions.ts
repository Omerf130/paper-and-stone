"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/authorization";
import { connectDB } from "@/lib/db/mongoose";
import { QuoteMutationError, QUOTE_ERRORS } from "@/lib/quotes/quote-errors";
import {
  acceptProjectQuote,
  requestProjectQuoteChange,
} from "@/lib/quotes/quote-mutations";
import {
  parseAcceptQuoteInput,
  parseRequestQuoteChangeInput,
} from "@/lib/quotes/quote-validation";
import type { QuoteActionState } from "@/types/project-quote";
import ProjectQuote from "@/models/ProjectQuote";

export async function acceptProjectQuoteAction(
  quoteId: string,
): Promise<QuoteActionState> {
  const user = await requireProfessional();

  const parsed = parseAcceptQuoteInput(quoteId);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await acceptProjectQuote(user.id, parsed.data.quoteId);

    await connectDB();
    const quote = await ProjectQuote.findById(parsed.data.quoteId)
      .select("projectId")
      .lean();
    const projectId = quote?.projectId.toString();

    revalidatePath("/professional");
    if (projectId) {
      revalidatePath(`/professional/projects/${projectId}`);
      revalidatePath("/admin/projects");
      revalidatePath(`/admin/projects/${projectId}`);
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof QuoteMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: QUOTE_ERRORS.GENERIC };
  }
}

export async function requestProjectQuoteChangeAction(
  input: Parameters<typeof parseRequestQuoteChangeInput>[0],
): Promise<QuoteActionState> {
  const user = await requireProfessional();

  const parsed = parseRequestQuoteChangeInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await requestProjectQuoteChange(
      user.id,
      parsed.data.quoteId,
      parsed.data.message,
    );

    await connectDB();
    const quote = await ProjectQuote.findById(parsed.data.quoteId)
      .select("projectId")
      .lean();
    const projectId = quote?.projectId.toString();

    revalidatePath("/professional");
    if (projectId) {
      revalidatePath(`/professional/projects/${projectId}`);
      revalidatePath("/admin/projects");
      revalidatePath(`/admin/projects/${projectId}`);
      revalidatePath("/admin");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof QuoteMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: QUOTE_ERRORS.GENERIC };
  }
}
