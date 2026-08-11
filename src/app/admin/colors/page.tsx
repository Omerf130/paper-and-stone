import type { Metadata } from "next";
import Link from "next/link";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import HexPreview from "@/components/admin/ColorForm/HexPreview";
import { getAdminColors } from "@/lib/colors/getAdminColors";
import styles from "../products/page.module.scss";

export const metadata: Metadata = {
  title: "צבעים | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminColorsPage() {
  const colors = await getAdminColors();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>צבעים</h1>
          <p className={styles.description}>ניהול ספריית הצבעים המרכזית.</p>
        </div>
        <Link href="/admin/colors/new" className={styles.createLink}>
          יצירת צבע חדש
        </Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
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
            {colors.map((color) => (
              <tr key={color.id}>
                <td>
                  <HexPreview hex={color.hex} size="sm" />
                </td>
                <td>{color.nameHe}</td>
                <td>{color.nameEn ?? "—"}</td>
                <td dir="ltr">{color.code ?? "—"}</td>
                <td dir="ltr">{color.hex}</td>
                <td>{color.sortOrder}</td>
                <td>{color.materialCount}</td>
                <td>
                  <AdminStatusBadge
                    active={color.isActive}
                    labelOn="פעיל"
                    labelOff="לא פעיל"
                  />
                </td>
                <td>{formatDate(color.updatedAt)}</td>
                <td>
                  <Link
                    href={`/admin/colors/${color.id}`}
                    className={styles.editLink}
                  >
                    עריכה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
