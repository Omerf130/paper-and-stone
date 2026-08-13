import styles from "./AdminHomepageSectionNav.module.scss";

const SECTIONS = [
  { id: "homepage-hero", label: "Hero" },
  { id: "homepage-categories", label: "קטגוריות" },
  { id: "homepage-featured", label: "מוצרים נבחרים" },
  { id: "homepage-about", label: "אודות" },
  { id: "homepage-professionals", label: "אנשי מקצוע" },
  { id: "homepage-inspiration", label: "השראה" },
  { id: "homepage-closing", label: "סיום" },
  { id: "homepage-section-order", label: "סדר הסקשנים" },
] as const;

export default function AdminHomepageSectionNav() {
  return (
    <nav className={styles.nav} aria-label="ניווט בין אזורי עריכת דף הבית">
      <ul className={styles.list}>
        {SECTIONS.map((section) => (
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
