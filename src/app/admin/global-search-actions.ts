"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  searchAdminGlobal,
  type AdminGlobalSearchResult,
} from "@/lib/admin/admin-global-search";

export async function searchAdminGlobalAction(
  query: string,
): Promise<{ result: AdminGlobalSearchResult; error?: string }> {
  await requireAdmin();

  try {
    const result = await searchAdminGlobal(query);
    return { result };
  } catch {
    return {
      result: { projects: [], products: [] },
      error: "לא ניתן לבצע חיפוש כרגע.",
    };
  }
}
