import type { Metadata } from "next";
import ColorForm from "@/components/admin/ColorForm/ColorForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { EMPTY_COLOR_FORM } from "@/types/admin-color";

export const metadata: Metadata = {
  title: "צבע חדש | Paper & Stone",
};

export default function AdminNewColorPage() {
  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת צבע"
        description="הגדירו צבע חדש בספרייה המרכזית."
        actions={
          <Button href="/admin/colors" variant="ghost" size="sm">
            חזרה לצבעים
          </Button>
        }
      />

      <ColorForm mode="create" initialColor={EMPTY_COLOR_FORM} />
    </AdminPage>
  );
}
