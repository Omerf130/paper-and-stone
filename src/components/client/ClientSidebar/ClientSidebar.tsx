"use client";

import { usePathname } from "next/navigation";
import type { ClientNavItem } from "@/config/client-nav";
import ClientBrand from "@/components/client/ClientBrand/ClientBrand";
import ClientNavList from "@/components/client/ClientNavList/ClientNavList";
import styles from "./ClientSidebar.module.scss";

type ClientSidebarProps = {
  items: ClientNavItem[];
};

export default function ClientSidebar({ items }: ClientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="ניווט אזור לקוח">
      <div className={styles.brandBlock}>
        <ClientBrand />
      </div>

      <nav className={styles.nav}>
        <ClientNavList items={items} pathname={pathname} variant="sidebar" />
      </nav>
    </aside>
  );
}
