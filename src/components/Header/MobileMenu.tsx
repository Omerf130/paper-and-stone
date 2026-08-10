"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import type { SafeUser } from "@/types/user";
import NavItemDisplay from "./NavItemDisplay";
import { CloseIcon, MenuIcon } from "./icons";
import styles from "./MobileMenu.module.scss";

type MobileMenuProps = {
  items: NavItem[];
  user: SafeUser | null;
  logoutAction: () => Promise<void>;
};

export default function MobileMenu({
  items,
  user,
  logoutAction,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

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
    <div className={styles.mobileMenu}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "סגירת תפריט" : "פתיחת תפריט"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <nav
            id={panelId}
            className={styles.panel}
            aria-label="ניווט ראשי"
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>תפריט</span>
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
                <li key={item.label}>
                  <NavItemDisplay item={item} className={styles.link} />
                </li>
              ))}
            </ul>

            <div className={styles.account}>
              {user ? (
                <>
                  <span className={styles.accountLabel}>החשבון שלי</span>
                  {user.role === "admin" && (
                    <Link href="/admin" className={styles.authLink}>
                      ניהול
                    </Link>
                  )}
                  <form action={logoutAction}>
                    <button type="submit" className={styles.logoutButton}>
                      התנתקות
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className={styles.authLink}>
                    התחברות
                  </Link>
                  <Link href="/register" className={styles.authLink}>
                    הרשמה
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
