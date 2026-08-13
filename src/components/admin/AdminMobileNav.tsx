"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AdminNavGroup } from "@/config/admin-nav";
import { CloseIcon, MenuIcon } from "@/components/Header/icons";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList/AdminNavList";
import styles from "./AdminMobileNav.module.scss";

type AdminMobileNavProps = {
  navGroups: AdminNavGroup[];
};

export default function AdminMobileNav({ navGroups }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div className={styles.mobileNav}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "סגירת תפריט ניהול" : "פתיחת תפריט ניהול"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen ? (
        <div className={styles.overlay}>
          <nav id={panelId} className={styles.panel} aria-label="ניווט ניהול">
            <div className={styles.panelHeader}>
              <AdminBrand />
              <button
                type="button"
                className={styles.closeButton}
                aria-label="סגירת תפריט"
                onClick={closeMenu}
              >
                <CloseIcon />
              </button>
            </div>

            <AdminNavList
              groups={navGroups}
              pathname={pathname}
              onNavigate={closeMenu}
              variant="mobile"
            />
          </nav>
        </div>
      ) : null}
    </div>
  );
}
