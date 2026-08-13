import type { Metadata } from "next";
import Link from "next/link";
import HexPreview from "@/components/admin/ColorForm/HexPreview";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import cardStyles from "@/components/admin/list/admin-list-card.module.scss";
import layoutStyles from "@/components/admin/list/admin-list-layout.module.scss";
import tableStyles from "@/components/admin/list/admin-table.module.scss";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getAdminColors } from "@/lib/colors/getAdminColors";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";

export const metadata: Metadata = {
  title: "צבעים | Paper & Stone",
};

export default async function AdminColorsPage() {
  const colors = await getAdminColors();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="צבעים"
        description="ניהול ספריית הצבעים"
        actions={
          <Button href="/admin/colors/new" size="sm">
            יצירת צבע
          </Button>
        }
      />

      {colors.length === 0 ? (
        <EmptyState
          title="אין עדיין צבעים"
          description="צרו צבע ראשון לספריית הצבעים."
          action={
            <Button href="/admin/colors/new" size="sm">
              יצירת צבע
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
                    <th scope="col">תצוגה</th>
                    <th scope="col">שם</th>
                    <th scope="col">שם באנגלית</th>
                    <th scope="col">קוד</th>
                    <th scope="col">HEX</th>
                    <th scope="col">סדר</th>
                    <th scope="col">חומרים</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color) => {
                    const status = mapEntityActiveToBadge(color.isActive);

                    return (
                      <tr key={color.id}>
                        <td>
                          <HexPreview hex={color.hex} size="sm" />
                        </td>
                        <td className={tableStyles.primary}>{color.nameHe}</td>
                        <td>{color.nameEn ?? "—"}</td>
                        <td dir="ltr">{color.code ?? "—"}</td>
                        <td dir="ltr">{color.hex}</td>
                        <td>{color.sortOrder}</td>
                        <td>{color.materialCount}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>{formatDateTime(color.updatedAt)}</td>
                        <td className={tableStyles.actions}>
                          <Link
                            href={`/admin/colors/${color.id}`}
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
            {colors.map((color) => {
              const status = mapEntityActiveToBadge(color.isActive);

              return (
                <li key={color.id} className={cardStyles.card}>
                  <div className={cardStyles.header}>
                    <div className={cardStyles.badges}>
                      <HexPreview hex={color.hex} size="sm" />
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </div>
                    <p className={cardStyles.title}>{color.nameHe}</p>
                    <p className={cardStyles.subtitle} dir="ltr">
                      {color.hex}
                    </p>
                  </div>

                  <div className={cardStyles.metaGrid}>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>חומרים:</span>
                      <span className={cardStyles.metaValue}>{color.materialCount}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>סדר:</span>
                      <span className={cardStyles.metaValue}>{color.sortOrder}</span>
                    </div>
                    <div className={cardStyles.metaRow}>
                      <span className={cardStyles.metaLabel}>עודכן:</span>
                      <span className={cardStyles.metaValue}>
                        {formatDateTime(color.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className={cardStyles.actions}>
                    <Button href={`/admin/colors/${color.id}`} variant="secondary" size="sm">
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
