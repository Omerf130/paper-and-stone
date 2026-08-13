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
import { getAdminCategories } from "@/lib/categories/getAdminCategories";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "קטגוריות | Paper & Stone",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="קטגוריות"
        description="ניהול קטגוריות הקטלוג"
        actions={
          <Button href="/admin/categories/new" size="sm">
            יצירת קטגוריה
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          title="אין עדיין קטגוריות"
          description="צרו קטגוריה ראשונה כדי לארגן את קטלוג המוצרים."
          action={
            <Button href="/admin/categories/new" size="sm">
              יצירת קטגוריה
            </Button>
          }
        />
      ) : (
        <>
          <div className={layoutStyles.desktopOnlyTablet}>
            <div className={tableStyles.wrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">שם</th>
                    <th scope="col">שם באנגלית</th>
                    <th scope="col">כתובת</th>
                    <th scope="col">סדר</th>
                    <th scope="col">מוצרים</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const status = mapEntityActiveToBadge(category.isActive);

                    return (
                      <tr key={category.id}>
                        <td className={tableStyles.primary}>{category.nameHe}</td>
                        <td>{category.nameEn ?? "—"}</td>
                        <td dir="ltr">{category.slug}</td>
                        <td>{category.sortOrder}</td>
                        <td>{category.productCount}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>{formatDateTime(category.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/categories/${category.id}`}
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

          <ul className={`${layoutStyles.mobileOnlyTablet} ${cardStyles.list}`}>
            {categories.map((category) => {
              const status = mapEntityActiveToBadge(category.isActive);

              return (
                <li key={category.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>{category.nameHe}</p>
                    {category.nameEn ? (
                      <p className={cardStyles.subtitle}>{category.nameEn}</p>
                    ) : null}
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>מוצרים:</span>
                      <span className={cardStyles.metaValue}>{category.productCount}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>סדר:</span>
                      <span className={cardStyles.metaValue}>{category.sortOrder}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(category.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button href={`/admin/categories/${category.id}`} variant="secondary" size="sm">
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
