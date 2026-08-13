import type { Metadata } from "next";
import MaterialForm from "@/components/admin/MaterialForm/MaterialForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getActiveColorsForPicker } from "@/lib/materials/getActiveColorsForPicker";
import { EMPTY_MATERIAL_FORM } from "@/types/admin-material";

export const metadata: Metadata = {
  title: "חומר חדש | Paper & Stone",
};

export default async function AdminNewMaterialPage() {
  const activeColors = await getActiveColorsForPicker();

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת חומר"
        description="הגדירו חומר חדש בספרייה המרכזית."
        actions={
          <Button href="/admin/materials" variant="ghost" size="sm">
            חזרה לחומרים
          </Button>
        }
      />

      <MaterialForm
        mode="create"
        initialMaterial={EMPTY_MATERIAL_FORM}
        activeColors={activeColors}
        linkedColorDetails={[]}
      />
    </AdminPage>
  );
}
