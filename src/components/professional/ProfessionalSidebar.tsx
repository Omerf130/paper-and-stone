"use client";

import { usePathname } from "next/navigation";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import ProfessionalBrand from "@/components/professional/ProfessionalBrand/ProfessionalBrand";
import ProfessionalNavList from "@/components/professional/ProfessionalNavList/ProfessionalNavList";
import styles from "./ProfessionalSidebar.module.scss";

type ProfessionalSidebarProps = {
  items: ProfessionalNavItem[];
};

export default function ProfessionalSidebar({ items }: ProfessionalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="ניווט אזור מקצועי">
      <div className={styles.brandBlock}>
        <ProfessionalBrand />
      </div>

      <nav className={styles.nav}>
        <ProfessionalNavList
          items={items}
          pathname={pathname}
          variant="sidebar"
        />
      </nav>
    </aside>
  );
}
