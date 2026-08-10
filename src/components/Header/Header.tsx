import Link from "next/link";
import Container from "@/components/Container/Container";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/logout-action";
import { mainNavItems } from "@/config/navigation";
import HeaderAccount from "./HeaderAccount";
import MobileMenu from "./MobileMenu";
import NavItemDisplay from "./NavItemDisplay";
import { SearchIcon } from "./icons";
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
                  <NavItemDisplay item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.searchButton}
              aria-label="חיפוש"
            >
              <SearchIcon />
            </button>

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
