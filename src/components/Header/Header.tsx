import Link from "next/link";
import Container from "@/components/Container/Container";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/logout-action";
import { mainNavItems } from "@/config/navigation";
import HeaderAccount from "./HeaderAccount";
import MobileMenu from "./MobileMenu";
import PublicNavItem from "./PublicNavItem";
import styles from "./Header.module.scss";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link href="/" className={styles.wordmark}>
            Paper &amp; Stone
          </Link>

          <nav className={styles.desktopNav} aria-label="ניווט ראשי">
            <ul className={styles.navList}>
              {mainNavItems.map((item) => (
                <li key={item.label}>
                  <PublicNavItem item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <div className={styles.account}>
              <HeaderAccount user={user} />
            </div>

            <MobileMenu
              items={mainNavItems}
              user={user}
              logoutAction={logoutAction}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
