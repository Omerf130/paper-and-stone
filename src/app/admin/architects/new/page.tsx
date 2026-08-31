import type { Metadata } from "next";
import { createArchitectAsAdminAction } from "@/app/admin/architects/actions";
import AdminCreateUserForm from "@/components/admin/crm/AdminCreateUserForm/AdminCreateUserForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";

export const metadata: Metadata = {
  title: "אדריכל חדש | Paper & Stone",
};

async function createArchitectAction(input: {
  fullName: string;
  email: string;
  identificationNumber: string;
  initialPassword: string;
  initialPasswordConfirm: string;
}) {
  "use server";
  const result = await createArchitectAsAdminAction(input);

  if ("error" in result && result.error) {
    return { error: result.error };
  }

  if ("success" in result && result.success && result.architectId) {
    return { success: true as const, userId: result.architectId };
  }

  return { error: "אירעה שגיאה ביצירת האדריכל." };
}

export default function AdminNewArchitectPage() {
  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת אדריכל"
        description="יצירת חשבון אדריכל חדש על ידי מנהל המערכת"
        actions={
          <Button href="/admin/architects" variant="ghost" size="sm">
            חזרה לאדריכלים
          </Button>
        }
      />

      <AdminCreateUserForm
        title="פרטי אדריכל"
        submitLabel="יצירת אדריכל"
        successRedirectPath="/admin/architects/[id]"
        onSubmit={createArchitectAction}
      />
    </AdminPage>
  );
}
