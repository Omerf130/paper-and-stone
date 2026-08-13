import type { Metadata } from "next";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { EMPTY_CATEGORY_FORM } from "@/types/admin-category";

export const metadata: Metadata = {
  title: "קטגוריה חדשה | Paper & Stone",
};

export default function AdminNewCategoryPage() {
  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת קטגוריה"
        description="הזינו את פרטי הקטגוריה."
        actions={
          <Button href="/admin/categories" variant="ghost" size="sm">
            חזרה לקטגוריות
          </Button>
        }
      />

      <CategoryForm mode="create" initialCategory={EMPTY_CATEGORY_FORM} />
    </AdminPage>
  );
}
