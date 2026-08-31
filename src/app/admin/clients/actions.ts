"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { searchClientsForAdmin } from "@/lib/admin/clients/client-lookup-queries";
import { createClientAsAdmin } from "@/lib/admin/crm/admin-create-user-mutations";
import { parseAdminCreateUserInput } from "@/lib/admin/crm/admin-create-user-validation";
import { UserMutationError } from "@/lib/users/user-errors";

export async function searchClientsForCrmAction(query: string) {
  await requireAdmin();
  const clients = await searchClientsForAdmin(query);
  return { clients };
}

export async function createClientAsAdminAction(input: unknown) {
  await requireAdmin();

  const parsed = parseAdminCreateUserInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    const clientId = await createClientAsAdmin(parsed.data);
    revalidatePath("/admin/clients");
    return { success: true, clientId };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה ביצירת הלקוח." };
  }
}
