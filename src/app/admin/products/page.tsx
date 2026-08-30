import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminProductsToolbar from "@/components/admin/AdminProductsToolbar/AdminProductsToolbar";
import ProductRowActions from "@/components/admin/ProductRowActions/ProductRowActions";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminCategories } from "@/lib/categories/getAdminCategories";
import { getAdminProducts } from "@/lib/products/getAdminProducts";
import {
  hasAdminProductsFilters,
  parseAdminProductsParams,
} from "@/lib/products/product-params";
import { getAdminSuppliers } from "@/lib/suppliers/getAdminSuppliers";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapEntityActiveToBadge,
  mapProductFeaturedToBadge,
} from "@/lib/ui/map-status-badge";

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

  const [result, categories, suppliers] = await Promise.all([
    getAdminProducts(params),
    getAdminCategories(),
    getAdminSuppliers(),
  ]);

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
      <AdminPageHeader
        title="מוצרים"
        description="ניהול קטלוג המוצרים"
        actions={
          <Button href="/admin/products/new" size="sm">
            הוספת מוצר
          </Button>
        }
      />

      <AdminProductsToolbar
        params={params}
        total={result.total}
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
          <div className={layoutStyles.desktopOnlyDesktop}>
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">שם</th>
                    <th scope="col">מק״ט</th>
                    <th scope="col">קטגוריה</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">מומלץ</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.products.map((product) => {
                    const activeStatus = mapEntityActiveToBadge(product.isActive);
                    const featuredStatus = mapProductFeaturedToBadge(
                      product.isFeatured,
                    );

                    return (
                      <tr key={product.id}>
                        <td className={tableStyles.primary}>{product.nameHe}</td>
                        <td dir="ltr">{product.sku}</td>
                        <td>{product.categoryName}</td>
                        <td>
                          <StatusBadge tone={activeStatus.tone}>
                            {activeStatus.label}
                          </StatusBadge>
                        </td>
                        <td>
                          <StatusBadge tone={featuredStatus.tone}>
                            {featuredStatus.label}
                          </StatusBadge>
                        </td>
                        <td>{formatDateTime(product.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <ProductRowActions product={product} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {result.products.map((product) => {
              const activeStatus = mapEntityActiveToBadge(product.isActive);
              const featuredStatus = mapProductFeaturedToBadge(product.isFeatured);

              return (
                <li key={product.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>{product.nameHe}</p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {product.sku}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={activeStatus.tone}>
                      {activeStatus.label}
                    </StatusBadge>
                    <StatusBadge tone={featuredStatus.tone}>
                      {featuredStatus.label}
                    </StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>קטגוריה:</span>
                      <span className={cardStyles.metaValue}>
                        {product.categoryName}
                      </span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(product.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <ProductRowActions product={product} layout="card" />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </AdminPage>
  );
}
