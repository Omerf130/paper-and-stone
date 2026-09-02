import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminProductsToolbar from "@/components/admin/AdminProductsToolbar/AdminProductsToolbar";
import AdminProductLibraryGrid from "@/components/admin/products/AdminProductLibraryGrid/AdminProductLibraryGrid";
import AdminProductLibraryMetrics from "@/components/admin/products/AdminProductLibraryMetrics/AdminProductLibraryMetrics";
import AdminProductsLibraryFooter from "@/components/admin/products/AdminProductsLibraryFooter/AdminProductsLibraryFooter";
import AdminProductsWorkspace from "@/components/admin/products/AdminProductsWorkspace/AdminProductsWorkspace";
import AdminWorkspacePageHeader from "@/components/admin/workspace/AdminWorkspacePageHeader";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminCategories } from "@/lib/categories/getAdminCategories";
import {
  getAdminProductLibraryMetrics,
  getAdminProducts,
} from "@/lib/products/getAdminProducts";
import { loadProductThumbnailMap } from "@/lib/products/loadProductThumbnailMap";
import {
  hasAdminProductsFilters,
  parseAdminProductsParams,
} from "@/lib/products/product-params";
import { getAdminSuppliers } from "@/lib/suppliers/getAdminSuppliers";
import styles from "./AdminProductsPage.module.scss";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
};

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminProductsParams(resolvedSearchParams);
  const filtered = hasAdminProductsFilters(params);

  const [result, categories, suppliers, metrics] = await Promise.all([
    getAdminProducts(params),
    getAdminCategories(),
    getAdminSuppliers(),
    getAdminProductLibraryMetrics(),
  ]);

  const thumbnailsByProductId = await loadProductThumbnailMap(
    result.products.map((product) => product.id),
  );

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: category.nameHe,
  }));

  const supplierOptions = suppliers.map((supplier) => ({
    id: supplier.id,
    label: supplier.name,
  }));

  return (
    <AdminPage width="wide">
      <div className={styles.page}>
        <AdminWorkspacePageHeader
          title="ספריית מוצרים"
          description="ניהול קטלוג המוצרים, נראות ומוצרים מומלצים."
          actions={
            <Button href="/admin/products/new" size="sm">
              + הוספת מוצר
            </Button>
          }
        />

        <AdminProductLibraryMetrics metrics={metrics} />

        <AdminProductsWorkspace>
          <AdminProductsToolbar
            params={params}
            categories={categoryOptions}
            suppliers={supplierOptions}
          />

          {result.products.length === 0 ? (
            <EmptyState
              title={
                filtered
                  ? "לא נמצאו מוצרים שמתאימים לסינון"
                  : "אין עדיין מוצרים"
              }
              description={
                filtered
                  ? "נסו לשנות את מסנני החיפוש."
                  : "הוסיפו מוצר ראשון לקטלוג."
              }
              action={
                filtered ? (
                  <Button href="/admin/products" variant="secondary" size="sm">
                    ניקוי סינון
                  </Button>
                ) : (
                  <Button href="/admin/products/new" size="sm">
                    הוספת מוצר
                  </Button>
                )
              }
            />
          ) : (
            <>
              <AdminProductLibraryGrid
                products={result.products}
                thumbnailsByProductId={thumbnailsByProductId}
              />
              <AdminProductsLibraryFooter total={result.total} />
            </>
          )}
        </AdminProductsWorkspace>
      </div>
    </AdminPage>
  );
}
