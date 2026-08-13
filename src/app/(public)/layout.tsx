import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { getPublicSiteSettings } from "@/lib/cms/get-public-site-settings";
import { mapSiteSettingsToPublic } from "@/lib/cms/map-site-settings-to-public";
import styles from "./layout.module.scss";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const siteSettings = mapSiteSettingsToPublic(await getPublicSiteSettings());

  return (
    <>
      <Header siteSettings={siteSettings} />
      <main className={styles.main}>{children}</main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
