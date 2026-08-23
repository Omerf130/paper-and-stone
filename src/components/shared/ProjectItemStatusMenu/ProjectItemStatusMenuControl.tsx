"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import ProjectItemStatusBadge from "@/components/shared/ProjectItemStatusBadge/ProjectItemStatusBadge";
import badgeStyles from "@/components/ui/StatusBadge/StatusBadge.module.scss";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import type { ProjectItemStatusPresentationRole } from "@/lib/project-items/project-item-status-presentation";
import type {
  ProjectItemStatus,
  ProjectItemStatusPresentation,
} from "@/types/project-item-status";
import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";
import type { ProjectItemStatusMenuOption } from "@/lib/project-items/project-item-status-menu-options";
import styles from "./ProjectItemStatusMenuControl.module.scss";

type ProjectItemStatusMenuControlProps = {
  status: ProjectItemStatus;
  role: ProjectItemStatusPresentationRole;
  presentation?: ProjectItemStatusPresentation;
  options: ProjectItemStatusMenuOption[];
  onSelect: (status: ProjectItemStatus) => void;
  isPending?: boolean;
  interactive?: boolean;
  size?: "default" | "prominent";
  error?: string;
};

const TONE_INDICATOR_CLASS: Record<StatusBadgeTone, string> = {
  neutral: styles.indicatorNeutral,
  positive: styles.indicatorPositive,
  warning: styles.indicatorWarning,
  negative: styles.indicatorNegative,
  info: styles.indicatorInfo,
};

function getFocusableMenuItemIndex(
  items: HTMLButtonElement[],
  startIndex: number,
  direction: 1 | -1,
): number {
  const count = items.length;
  if (count === 0) {
    return -1;
  }

  for (let step = 1; step <= count; step += 1) {
    const index = (startIndex + direction * step + count) % count;
    if (!items[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export default function ProjectItemStatusMenuControl({
  status,
  role,
  presentation,
  options,
  onSelect,
  isPending = false,
  interactive = true,
  size = "default",
  error,
}: ProjectItemStatusMenuControlProps) {
  const resolved =
    presentation ?? getProjectItemStatusPresentation(status, role);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback(
    (targetStatus: ProjectItemStatus) => {
      if (isPending || targetStatus === status) {
        closeMenu();
        return;
      }

      onSelect(targetStatus);
      closeMenu();
    },
    [closeMenu, isPending, onSelect, status],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) {
      return;
    }

    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]',
      ),
    );
    const firstEnabledIndex = items.findIndex((item) => !item.disabled);
    items[firstEnabledIndex >= 0 ? firstEnabledIndex : 0]?.focus();
  }, [isOpen]);

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (!menuRef.current) {
      return;
    }

    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]',
      ),
    );
    const activeIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = getFocusableMenuItemIndex(
        items,
        activeIndex >= 0 ? activeIndex : 0,
        1,
      );
      items[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = getFocusableMenuItemIndex(
        items,
        activeIndex >= 0 ? activeIndex : 0,
        -1,
      );
      items[nextIndex]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const firstIndex = getFocusableMenuItemIndex(items, -1, 1);
      items[firstIndex]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastIndex = getFocusableMenuItemIndex(items, 0, -1);
      items[lastIndex]?.focus();
    }
  };

  if (!interactive) {
    return (
      <div className={styles.wrapper} aria-live="polite">
        <ProjectItemStatusBadge
          status={status}
          role={role}
          presentation={presentation}
          size={size}
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const triggerSizeClass =
    size === "prominent" ? styles.prominentTrigger : styles.defaultTrigger;

  return (
    <div className={styles.wrapper} aria-live="polite">
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${badgeStyles[resolved.tone]} ${triggerSizeClass}`.trim()}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-busy={isPending}
        aria-label={`סטטוס מוצר: ${resolved.label}`}
        disabled={isPending}
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }

          openMenu();
        }}
      >
        <span className={styles.triggerLabel}>{resolved.label}</span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          className={styles.menu}
          aria-label="אפשרויות סטטוס"
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                disabled={Boolean(option.isCurrent) || isPending}
                aria-current={option.isCurrent ? "true" : undefined}
                onClick={() => {
                  handleSelect(option.value);
                }}
              >
                <span
                  className={`${styles.indicator} ${TONE_INDICATOR_CLASS[option.presentation.tone]}`}
                  aria-hidden="true"
                />
                <span className={styles.menuLabel}>{option.presentation.label}</span>
                {option.isCurrent ? (
                  <span className={styles.currentMark} aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
