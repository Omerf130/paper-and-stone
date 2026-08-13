import styles from "./AdminProductSectionNav.module.scss";

const EDIT_SECTIONS = [
  { id: "product-identity", label: "פרטים" },
  { id: "product-content", label: "תוכן" },
  { id: "product-config", label: "תצורה" },
  { id: "product-spec", label: "מפרט" },
  { id: "product-media", label: "מדיה" },
  { id: "product-recolor", label: "צביעה" },
] as const;

export default function AdminProductSectionNav() {
  return (
    <nav className={styles.nav} aria-label="ניווט בין אזורי עריכת המוצר">
      <ul className={styles.list}>
        {EDIT_SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={styles.link}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
