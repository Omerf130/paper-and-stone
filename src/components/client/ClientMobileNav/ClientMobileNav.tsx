"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ClientNavItem } from "@/config/client-nav";
import { CloseIcon, MenuIcon } from "@/components/Header/icons";
import ClientBrand from "@/components/client/ClientBrand/ClientBrand";
import ClientNavList from "@/components/client/ClientNavList/ClientNavList";
import styles from "./ClientMobileNav.module.scss";

type ClientMobileNavProps = {
  items: ClientNavItem[];
};

export default function ClientMobileNav({ items }: ClientMobileNavProps) {
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
        aria-label={isOpen ? "סגירת תפריט אזור לקוח" : "פתיחת תפריט אזור לקוח"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen ? (
        <div className={styles.overlay}>
          <nav
            id={panelId}
            className={styles.panel}
            aria-label="ניווט אזור לקוח"
          >
            <div className={styles.panelHeader}>
              <ClientBrand compact />
              <button
                type="button"
                className={styles.closeButton}
                aria-label="סגירת תפריט"
                onClick={closeMenu}
              >
                <CloseIcon />
              </button>
            </div>

            <ClientNavList
              items={items}
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
