import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container/Container";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/logout-action";
import { mainNavItems } from "@/config/navigation";
import type { PublicSiteSettingsView } from "@/types/public-site-settings";
import HeaderAccount from "./HeaderAccount";
import MobileMenu from "./MobileMenu";
import PublicNavItem from "./PublicNavItem";
import styles from "./Header.module.scss";

type HeaderProps = {
  siteSettings: PublicSiteSettingsView;
};

export default async function Header({ siteSettings }: HeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link href="/" className={styles.brandLink}>
            {siteSettings.logo ? (
              <span className={styles.logoWrap}>
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt}
                  width={siteSettings.logo.width ?? 160}
                  height={siteSettings.logo.height ?? 40}
                  className={styles.logo}
                  sizes="160px"
                />
              </span>
            ) : (
              <span className={styles.wordmark}>{siteSettings.brandName}</span>
            )}
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
