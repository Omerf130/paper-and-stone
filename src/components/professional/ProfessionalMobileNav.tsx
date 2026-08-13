"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import { CloseIcon, MenuIcon } from "@/components/Header/icons";
import ProfessionalBrand from "@/components/professional/ProfessionalBrand/ProfessionalBrand";
import ProfessionalNavList from "@/components/professional/ProfessionalNavList/ProfessionalNavList";
import styles from "./ProfessionalMobileNav.module.scss";

type ProfessionalMobileNavProps = {
  items: ProfessionalNavItem[];
};

export default function ProfessionalMobileNav({
  items,
}: ProfessionalMobileNavProps) {
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
        aria-label={isOpen ? "סגירת תפריט אזור מקצועי" : "פתיחת תפריט אזור מקצועי"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <nav
            id={panelId}
            className={styles.panel}
            aria-label="ניווט אזור מקצועי"
          >
            <div className={styles.panelHeader}>
              <ProfessionalBrand compact />
              <button
                type="button"
                className={styles.closeButton}
                aria-label="סגירת תפריט"
                onClick={closeMenu}
              >
                <CloseIcon />
              </button>
            </div>

            <ProfessionalNavList
              items={items}
              pathname={pathname}
              onNavigate={closeMenu}
              variant="mobile"
            />
          </nav>
        </div>
      )}
    </div>
  );
}
