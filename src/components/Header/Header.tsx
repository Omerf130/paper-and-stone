import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container/Container";
import { secondaryNavItems } from "@/config/navigation";
import { getPublicCategoryNavTree } from "@/lib/categories/get-public-category-nav-tree";
import { getPublicHomepageContent } from "@/lib/cms/get-public-homepage-content";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/logout-action";
import type { PublicSiteSettingsView } from "@/types/public-site-settings";
import HeaderAccountIcon from "./HeaderAccountIcon";
import HeaderDesktopNav from "./HeaderDesktopNav";
import LanguageToggle from "./LanguageToggle";
import MobileMenu from "./MobileMenu";
import { SearchIcon } from "./icons";
import styles from "./Header.module.scss";

type HeaderProps = {
  siteSettings: PublicSiteSettingsView;
};

export default async function Header({ siteSettings }: HeaderProps) {
  const [user, homepageContent] = await Promise.all([
    getCurrentUser(),
    getPublicHomepageContent(),
  ]);

  const navTree = await getPublicCategoryNavTree({
    homepageCategoryTileHrefs: homepageContent.categories.tiles.map((tile) => ({
      href: tile.href,
      image: tile.image,
    })),
  });

  return (
    <header className={styles.header}>
      <Container variant="wide">
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

          <HeaderDesktopNav navTree={navTree} />

          <div className={styles.actions}>
            <Link href="/products" className={styles.searchLink} aria-label="חיפוש מוצרים">
              <SearchIcon />
            </Link>

            <HeaderAccountIcon user={user} />
            <LanguageToggle />

            <MobileMenu
              navTree={navTree}
              secondaryItems={secondaryNavItems}
              user={user}
              logoutAction={logoutAction}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
