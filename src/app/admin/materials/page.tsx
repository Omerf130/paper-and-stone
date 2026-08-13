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
import { getAdminMaterials } from "@/lib/materials/getAdminMaterials";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";
import { MATERIAL_TYPE_LABELS } from "@/types/material";

export const metadata: Metadata = {
  title: "חומרים | Paper & Stone",
};

export default async function AdminMaterialsPage() {
  const materials = await getAdminMaterials();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="חומרים"
        description="ניהול ספריית החומרים"
        actions={
          <Button href="/admin/materials/new" size="sm">
            יצירת חומר
          </Button>
        }
      />

      {materials.length === 0 ? (
        <EmptyState
          title="אין עדיין חומרים"
          description="צרו חומר ראשון לספריית החומרים."
          action={
            <Button href="/admin/materials/new" size="sm">
              יצירת חומר
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
                    <th scope="col">שם באנגלית</th>
                    <th scope="col">קוד</th>
                    <th scope="col">סוג</th>
                    <th scope="col">צבעים</th>
                    <th scope="col">סדר</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => {
                    const status = mapEntityActiveToBadge(material.isActive);

                    return (
                      <tr key={material.id}>
                        <td className={tableStyles.primary}>{material.nameHe}</td>
                        <td>{material.nameEn ?? "—"}</td>
                        <td dir="ltr">{material.code ?? "—"}</td>
                        <td>{MATERIAL_TYPE_LABELS[material.type]}</td>
                        <td>{material.colorCount}</td>
                        <td>{material.sortOrder}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>{formatDateTime(material.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/materials/${material.id}`}
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
            {materials.map((material) => {
              const status = mapEntityActiveToBadge(material.isActive);

              return (
                <li key={material.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <p className={cardStyles.title}>{material.nameHe}</p>
                    <p className={cardStyles.subtitle}>
                      {MATERIAL_TYPE_LABELS[material.type]}
                    </p>
                  </div>

                  <div className={cardStyles.badges}>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>צבעים:</span>
                      <span className={cardStyles.metaValue}>{material.colorCount}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>סדר:</span>
                      <span className={cardStyles.metaValue}>{material.sortOrder}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(material.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button href={`/admin/materials/${material.id}`} variant="secondary" size="sm">
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
