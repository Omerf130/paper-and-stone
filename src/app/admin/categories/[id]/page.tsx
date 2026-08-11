import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import { getAdminCategoryById } from "@/lib/categories/getAdminCategoryById";
import styles from "../../products/new/page.module.scss";

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
  searchParams,
}: AdminEditCategoryPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>עריכת קטגוריה</h1>
        <p className={styles.description}>{category.nameHe}</p>
      </header>

      <CategoryForm
        mode="edit"
        initialCategory={category}
        categoryId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
      />
    </div>
  );
}
