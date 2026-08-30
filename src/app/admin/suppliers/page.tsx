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
import { getAdminSuppliers } from "@/lib/suppliers/getAdminSuppliers";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "ספקים | Paper & Stone",
};

export default async function AdminSuppliersPage() {
  const suppliers = await getAdminSuppliers();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="ספקים"
        description="ניהול ספקי המוצרים"
        actions={
          <Button href="/admin/suppliers/new" size="sm">
            יצירת ספק
          </Button>
        }
      />

      {suppliers.length === 0 ? (
        <EmptyState
          title="אין עדיין ספקים"
          description="צרו ספק ראשון לפני שיוך מוצרים."
          action={
            <Button href="/admin/suppliers/new" size="sm">
              יצירת ספק
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
                    <th scope="col">קוד</th>
                    <th scope="col">מוצרים</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => {
                    const status = mapEntityActiveToBadge(supplier.isActive);

                    return (
                      <tr key={supplier.id}>
                        <td className={tableStyles.primary}>{supplier.name}</td>
                        <td dir="ltr">{supplier.code ?? "—"}</td>
                        <td>{supplier.productCount}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>{formatDateTime(supplier.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/suppliers/${supplier.id}`}
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
            {suppliers.map((supplier) => {
              const status = mapEntityActiveToBadge(supplier.isActive);

              return (
                <li key={supplier.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>{supplier.name}</p>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>
                  <div className={cardStyles.actions}>
                    <Button href={`/admin/suppliers/${supplier.id}`} variant="secondary" size="sm">
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
