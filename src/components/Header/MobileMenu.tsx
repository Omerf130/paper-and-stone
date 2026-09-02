"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import {
  canAccessArchitectWorkspace,
  canAccessClientWorkspace,
} from "@/lib/auth/account-access";
import type { SafeUser } from "@/types/user";
import type { PublicCategoryNavTreeView } from "@/types/public-category-nav";
import PublicNavItem from "./PublicNavItem";
import { CloseIcon, MenuIcon } from "./icons";
import styles from "./MobileMenu.module.scss";

type MobileMenuProps = {
  navTree: PublicCategoryNavTreeView;
  secondaryItems: NavItem[];
  user: SafeUser | null;
  logoutAction: () => Promise<void>;
};

export default function MobileMenu({
  navTree,
  secondaryItems,
  user,
  logoutAction,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedDepartmentSlug, setExpandedDepartmentSlug] = useState<string | null>(
    null,
  );
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setExpandedDepartmentSlug(null);
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

  const showClientLink = user ? canAccessClientWorkspace(user) : false;
  const showArchitectLink = user ? canAccessArchitectWorkspace(user) : false;
  const showAccountStatusLink =
    user !== null &&
    !showClientLink &&
    !showArchitectLink &&
    user.role !== "admin";

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
          <nav id={panelId} className={styles.panel} aria-label="ניווט ראשי">
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

            <div className={styles.section}>
              <p className={styles.sectionTitle}>קטגוריות</p>
              <ul className={styles.list}>
                <li>
                  <Link href="/products" className={styles.link} onClick={closeMenu}>
                    כל המוצרים
                  </Link>
                </li>
                {navTree.departments.map((department) => (
                  <li key={department.slug}>
                    {department.groups.length > 0 ? (
                      <>
                        <button
                          type="button"
                          className={styles.expandButton}
                          aria-expanded={expandedDepartmentSlug === department.slug}
                          onClick={() =>
                            setExpandedDepartmentSlug((current) =>
                              current === department.slug ? null : department.slug,
                            )
                          }
                        >
                          {department.nameHe}
                        </button>
                        {expandedDepartmentSlug === department.slug ? (
                          <ul className={styles.subList}>
                            {department.groups.map((group) => (
                              <li key={group.slug}>
                                <p className={styles.subHeading}>{group.nameHe}</p>
                                <ul className={styles.subList}>
                                  {group.leaves.map((leaf) => (
                                    <li key={leaf.slug}>
                                      {leaf.isNavigable && leaf.href ? (
                                        <Link
                                          href={leaf.href}
                                          className={styles.subLink}
                                          onClick={closeMenu}
                                        >
                                          {leaf.nameHe}
                                        </Link>
                                      ) : (
                                        <span
                                          className={`${styles.subLink} ${styles.subLinkDisabled}`}
                                          aria-disabled="true"
                                        >
                                          {leaf.nameHe}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : department.isNavigable && department.href ? (
                      <Link
                        href={department.href}
                        className={styles.link}
                        onClick={closeMenu}
                      >
                        {department.nameHe}
                      </Link>
                    ) : (
                      <span
                        className={`${styles.link} ${styles.subLinkDisabled}`}
                        aria-disabled="true"
                      >
                        {department.nameHe}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {secondaryItems.length > 0 ? (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>עוד</p>
                <ul className={styles.list}>
                  {secondaryItems.map((item) => (
                    <li key={item.label}>
                      <PublicNavItem
                        item={item}
                        className={styles.link}
                        onNavigate={closeMenu}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={styles.account}>
              {user ? (
                <>
                  <span className={styles.accountLabel}>החשבון שלי</span>
                  {user.role === "admin" && (
                    <Link href="/admin" className={styles.authLink}>
                      ניהול
                    </Link>
                  )}
                  {showArchitectLink && (
                    <Link href="/professional" className={styles.authLink}>
                      אזור אדריכל
                    </Link>
                  )}
                  {showClientLink && (
                    <Link href="/client" className={styles.authLink}>
                      אזור לקוח
                    </Link>
                  )}
                  {showAccountStatusLink && (
                    <Link href="/account/status" className={styles.authLink}>
                      סטטוס חשבון
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
