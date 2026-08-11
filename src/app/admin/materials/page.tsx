import type { Metadata } from "next";
import Link from "next/link";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { getAdminMaterials } from "@/lib/materials/getAdminMaterials";
import { MATERIAL_TYPE_LABELS } from "@/types/material";
import styles from "../products/page.module.scss";

export const metadata: Metadata = {
  title: "חומרים | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminMaterialsPage() {
  const materials = await getAdminMaterials();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>חומרים</h1>
          <p className={styles.description}>ניהול ספריית החומרים המרכזית.</p>
        </div>
        <Link href="/admin/materials/new" className={styles.createLink}>
          יצירת חומר חדש
        </Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
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
            {materials.map((material) => (
              <tr key={material.id}>
                <td>{material.nameHe}</td>
                <td>{material.nameEn ?? "—"}</td>
                <td dir="ltr">{material.code ?? "—"}</td>
                <td>{MATERIAL_TYPE_LABELS[material.type]}</td>
                <td>{material.colorCount}</td>
                <td>{material.sortOrder}</td>
                <td>
                  <AdminStatusBadge
                    active={material.isActive}
                    labelOn="פעיל"
                    labelOff="לא פעיל"
                  />
                </td>
                <td>{formatDate(material.updatedAt)}</td>
                <td>
                  <Link
                    href={`/admin/materials/${material.id}`}
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
