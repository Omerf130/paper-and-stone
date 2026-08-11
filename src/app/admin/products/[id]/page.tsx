import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import { getProductFormCategoryOptions } from "@/lib/categories/getProductFormCategoryOptions";
import { getAdminProductById } from "@/lib/products/getAdminProductById";
import styles from "../new/page.module.scss";

type AdminEditProductPageProps = PageProps<"/admin/products/[id]">;

export async function generateMetadata({
  params,
}: AdminEditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);

  return {
    title: product
      ? `עריכת ${product.nameHe} | Paper & Stone`
      : "עריכת מוצר | Paper & Stone",
  };
}

export default async function AdminEditProductPage({
  params,
  searchParams,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await getProductFormCategoryOptions(product.categoryId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>עריכת מוצר</h1>
        <p className={styles.description}>{product.nameHe}</p>
      </header>

      <ProductForm
        mode="edit"
        categories={categories}
        initialProduct={product}
        productId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
      />
    </div>
  );
}
