import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getAdminCategoryById } from "@/lib/categories/getAdminCategoryById";

type AdminEditCategoryPageProps = PageProps<"/admin/categories/[id]">;

export async function generateMetadata({
  params,
}: AdminEditCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  return {
    title: category
      ? `עריכת ${category.nameHe} | Paper & Stone`
      : "עריכת קטגוריה | Paper & Stone",
  };
}

export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="עריכת קטגוריה"
        description={category.nameHe}
        actions={
          <Button href="/admin/categories" variant="ghost" size="sm">
            חזרה לקטגוריות
          </Button>
        }
      />

      <CategoryForm mode="edit" initialCategory={category} categoryId={id} />
    </AdminPage>
  );
}
