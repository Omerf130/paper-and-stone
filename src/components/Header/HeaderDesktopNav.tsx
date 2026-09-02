"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { departmentHasMegaMenuContent } from "@/lib/categories/department-has-mega-menu-content";
import type { PublicCategoryNavTreeView } from "@/types/public-category-nav";
import CategoryMegaMenu from "./CategoryMegaMenu";
import styles from "./HeaderDesktopNav.module.scss";

type HeaderDesktopNavProps = {
  navTree: PublicCategoryNavTreeView;
};

const MENU_CLOSE_DELAY_MS = 120;

export default function HeaderDesktopNav({ navTree }: HeaderDesktopNavProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const activeDepartment =
    navTree.departments.find((department) => department.slug === activeSlug) ?? null;
  const isMenuOpen =
    activeDepartment !== null && departmentHasMegaMenuContent(activeDepartment);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setActiveSlug(null);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(closeMenu, MENU_CLOSE_DELAY_MS);
  }, [clearCloseTimer, closeMenu]);

  const openDepartmentMenu = useCallback((slug: string) => {
    const department = navTree.departments.find((item) => item.slug === slug);

    if (department && departmentHasMegaMenuContent(department)) {
      clearCloseTimer();
      setActiveSlug(slug);
    }
  }, [clearCloseTimer, navTree.departments]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      closeMenu();
    }
  };

  if (navTree.departments.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.menuRoot}
      onMouseLeave={scheduleClose}
      onMouseEnter={clearCloseTimer}
      onBlur={handleBlur}
    >
      <nav className={styles.nav} aria-label="קטגוריות">
        <ul className={styles.list}>
          {navTree.departments.map((department) => {
            const hasMenuContent = departmentHasMegaMenuContent(department);
            const isActive = isMenuOpen && activeSlug === department.slug;
            const labelClassName = isActive
              ? `${styles.link} ${styles.linkActive}`
              : styles.link;

            return (
              <li
                key={department.slug}
                className={styles.item}
                onMouseEnter={() => openDepartmentMenu(department.slug)}
              >
                {department.isNavigable && department.href ? (
                  <Link
                    href={department.href}
                    className={labelClassName}
                    aria-expanded={hasMenuContent ? isActive : undefined}
                    aria-controls={hasMenuContent && isActive ? panelId : undefined}
                    aria-haspopup={hasMenuContent ? "true" : undefined}
                    onFocus={() => openDepartmentMenu(department.slug)}
                  >
                    {department.nameHe}
                  </Link>
                ) : (
                  <span
                    className={`${labelClassName} ${styles.linkDisabled}`}
                    aria-expanded={hasMenuContent ? isActive : undefined}
                    aria-controls={hasMenuContent && isActive ? panelId : undefined}
                    aria-haspopup={hasMenuContent ? "true" : undefined}
                    onFocus={() => openDepartmentMenu(department.slug)}
                    tabIndex={hasMenuContent ? 0 : -1}
                  >
                    {department.nameHe}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <CategoryMegaMenu
        department={activeDepartment}
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onPanelMouseEnter={clearCloseTimer}
        panelId={panelId}
      />
    </div>
  );
}
