import type { Metadata } from "next";
import MaterialForm from "@/components/admin/MaterialForm/MaterialForm";
import { getActiveColorsForPicker } from "@/lib/materials/getActiveColorsForPicker";
import { EMPTY_MATERIAL_FORM } from "@/types/admin-material";
import styles from "../../products/new/page.module.scss";

export const metadata: Metadata = {
  title: "חומר חדש | Paper & Stone",
};

export default async function AdminNewMaterialPage() {
  const activeColors = await getActiveColorsForPicker();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>יצירת חומר חדש</h1>
        <p className={styles.description}>הגדירו חומר חדש בספרייה המרכזית.</p>
      </header>

      <MaterialForm
        mode="create"
        initialMaterial={EMPTY_MATERIAL_FORM}
        activeColors={activeColors}
        linkedColorDetails={[]}
      />
    </div>
  );
}
