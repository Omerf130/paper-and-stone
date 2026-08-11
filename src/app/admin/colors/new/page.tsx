import type { Metadata } from "next";
import ColorForm from "@/components/admin/ColorForm/ColorForm";
import { EMPTY_COLOR_FORM } from "@/types/admin-color";
import styles from "../../products/new/page.module.scss";

export const metadata: Metadata = {
  title: "צבע חדש | Paper & Stone",
};

export default function AdminNewColorPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>יצירת צבע חדש</h1>
        <p className={styles.description}>הגדירו צבע חדש בספרייה המרכזית.</p>
      </header>

      <ColorForm mode="create" initialColor={EMPTY_COLOR_FORM} />
    </div>
  );
}
