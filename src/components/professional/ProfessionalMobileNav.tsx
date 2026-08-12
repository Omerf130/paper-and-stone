"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import { CloseIcon, MenuIcon } from "@/components/Header/icons";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./ProfessionalMobileNav.module.scss";

type ProfessionalMobileNavProps = {
  items: ProfessionalNavItem[];
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/professional") {
    return pathname === "/professional";
  }

  return pathname.startsWith(href);
}

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
              <span className={styles.panelTitle}>אזור מקצועי</span>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="סגירת תפריט"
                onClick={closeMenu}
              >
                <CloseIcon />
              </button>
            </div>

            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      isActivePath(pathname, item.href)
                        ? `${styles.link} ${styles.active}`
                        : styles.link
                    }
                    onClick={closeMenu}
                  >
                    <span className={styles.linkContent}>
                      {item.label}
                      {item.badgeCount && item.badgeCount > 0 ? (
                        <NavBadge
                          count={item.badgeCount}
                          ariaLabel={`${item.badgeCount} התראות שלא נקראו`}
                        />
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
