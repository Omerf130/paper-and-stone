import Image from "next/image";
import Container from "@/components/Container/Container";
import BenefitsStrip from "@/components/BenefitsStrip/BenefitsStrip";
import PublicNavItem from "@/components/Header/PublicNavItem";
import { footerNavGroups } from "@/config/navigation";
import type { PublicSiteSettingsView } from "@/types/public-site-settings";
import styles from "./Footer.module.scss";

type FooterProps = {
  siteSettings: PublicSiteSettingsView;
};

export default function Footer({ siteSettings }: FooterProps) {
  const year = new Date().getFullYear();
  const copyrightName =
    siteSettings.copyrightCompanyName?.trim() || siteSettings.brandName;

  return (
    <footer className={styles.footer}>
      <Container variant="wide">
        <div className={styles.mainGrid}>
          <div className={styles.brand}>
            {siteSettings.logo ? (
              <div className={styles.logoWrap}>
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt}
                  width={siteSettings.logo.width ?? 160}
                  height={siteSettings.logo.height ?? 40}
                  className={styles.logo}
                  sizes="160px"
                />
              </div>
            ) : (
              <p className={styles.wordmark}>{siteSettings.brandName}</p>
            )}
            <p className={styles.tagline}>{siteSettings.footerDescription}</p>
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
                      <PublicNavItem
                        item={item}
                        className={styles.navLink}
                        tone="light"
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className={styles.contact}>
            <p className={styles.navTitle}>יצירת קשר</p>
            {siteSettings.hasContactDetails ? (
              <ul className={styles.contactList}>
                {siteSettings.contactItems.map((item) => (
                  <li key={item.kind}>
                    {item.href ? (
                      <a href={item.href} className={styles.contactLink}>
                        {item.value}
                      </a>
                    ) : (
                      <span className={styles.contactText}>{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.contactText}>פרטי יצירת קשר — בקרוב</p>
            )}
          </div>

          <div className={styles.newsletter}>
            <p className={styles.navTitle}>הישארו מחוברים</p>
            <p className={styles.newsletterText}>
              הרשמה לעדכונים — בקרוב
            </p>
          </div>
        </div>
      </Container>

      <BenefitsStrip />

      <div className={styles.bottomBar}>
        <Container variant="wide">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              &copy; {year} {copyrightName}
            </p>
            <p className={styles.weblioCredit}>
              <a
                href="https://www.weblio.co.il/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.weblioLink}
              >
                אתר זה נבנה על ידי Weblio
              </a>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
