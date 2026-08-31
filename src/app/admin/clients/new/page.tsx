import type { Metadata } from "next";
import { createClientAsAdminAction } from "@/app/admin/clients/actions";
import AdminCreateUserForm from "@/components/admin/crm/AdminCreateUserForm/AdminCreateUserForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";

export const metadata: Metadata = {
  title: "לקוח חדש | Paper & Stone",
};

async function createClientAction(input: {
  fullName: string;
  email: string;
  identificationNumber: string;
  initialPassword: string;
  initialPasswordConfirm: string;
}) {
  "use server";
  const result = await createClientAsAdminAction(input);

  if ("error" in result && result.error) {
    return { error: result.error };
  }

  if ("success" in result && result.success && result.clientId) {
    return { success: true as const, userId: result.clientId };
  }

  return { error: "אירעה שגיאה ביצירת הלקוח." };
}

export default function AdminNewClientPage() {
  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת לקוח"
        description="יצירת חשבון לקוח חדש על ידי מנהל המערכת"
        actions={
          <Button href="/admin/clients" variant="ghost" size="sm">
            חזרה ללקוחות
          </Button>
        }
      />

      <AdminCreateUserForm
        title="פרטי לקוח"
        submitLabel="יצירת לקוח"
        successRedirectPath="/admin/clients/[id]"
        onSubmit={createClientAction}
      />
    </AdminPage>
  );
}
