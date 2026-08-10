import Container from "@/components/Container/Container";
import { footerNavGroups } from "@/config/navigation";
import NavItemDisplay from "@/components/Header/NavItemDisplay";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.wordmark}>Paper &amp; Stone</p>
            <p className={styles.tagline}>
              ריהוט, חומרים ופתרונות לפרויקטים
            </p>
          </div>

          <div className={styles.navGroups}>
            {footerNavGroups.map((group) => (
              <nav
                key={group.title}
                className={styles.navGroup}
                aria-label={group.title}
              >
                <p className={styles.navTitle}>{group.title}</p>
                <ul className={styles.navList}>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <NavItemDisplay item={item} className={styles.navLink} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className={styles.contact}>
            <p className={styles.navTitle}>יצירת קשר</p>
            <p className={styles.contactText}>פרטי יצירת קשר — בקרוב</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {year} Paper &amp; Stone
          </p>
        </div>
      </Container>
    </footer>
  );
}
