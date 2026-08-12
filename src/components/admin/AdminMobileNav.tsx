"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AdminNavItem } from "@/config/admin-nav";
import { CloseIcon, MenuIcon } from "@/components/Header/icons";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./AdminMobileNav.module.scss";

type AdminMobileNavProps = {
  items: AdminNavItem[];
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(href);
}

export default function AdminMobileNav({ items }: AdminMobileNavProps) {
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

      {isOpen && (
        <div className={styles.overlay}>
          <nav id={panelId} className={styles.panel} aria-label="ניווט ניהול">
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>ניהול</span>
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
                          ariaLabel={`${item.badgeCount} פרויקטים ממתינים לבדיקה`}
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
