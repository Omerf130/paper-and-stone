import type { Metadata } from "next";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminProducts } from "@/lib/products/getAdminProducts";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapEntityActiveToBadge,
  mapProductFeaturedToBadge,
} from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

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

      {products.length === 0 ? (
        <EmptyState
          title="אין עדיין מוצרים"
          description="הוסיפו מוצר ראשון לקטלוג."
          action={
            <Button href="/admin/products/new" size="sm">
              הוספת מוצר
            </Button>
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
                  {products.map((product) => {
                    const activeStatus = mapEntityActiveToBadge(product.isActive);
                    const featuredStatus = mapProductFeaturedToBadge(product.isFeatured);

                    return (
                      <tr key={product.id}>
                        <td className={tableStyles.primary}>{product.nameHe}</td>
                        <td dir="ltr">{product.sku}</td>
                        <td>{product.categoryName}</td>
                        <td>
                          <StatusBadge tone={activeStatus.tone}>{activeStatus.label}</StatusBadge>
                        </td>
                        <td>
                          <StatusBadge tone={featuredStatus.tone}>
                            {featuredStatus.label}
                          </StatusBadge>
                        </td>
                        <td>{formatDateTime(product.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className={tableStyles.actionLink}
                          >
                            עריכה
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${layoutStyles.mobileOnlyDesktop} ${cardStyles.list}`}>
            {products.map((product) => {
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
                    <StatusBadge tone={activeStatus.tone}>{activeStatus.label}</StatusBadge>
                    <StatusBadge tone={featuredStatus.tone}>{featuredStatus.label}</StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>קטגוריה:</span>
                      <span className={cardStyles.metaValue}>{product.categoryName}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(product.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button href={`/admin/products/${product.id}`} variant="secondary" size="sm">
                      עריכה
                    </Button>
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
