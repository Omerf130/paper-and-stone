"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./Tabs.module.scss";

export type TabItem = {
  id: string;
  label: string;
  panel: ReactNode;
  hasError?: boolean;
};

type TabsProps = {
  items: TabItem[];
  defaultTabId?: string;
  initialTabId?: string;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ReactNode;
  ariaLabel?: string;
};

function getNextTabIndex(
  currentIndex: number,
  direction: 1 | -1,
  count: number,
): number {
  return (currentIndex + direction + count) % count;
}

export default function Tabs({
  items,
  defaultTabId,
  initialTabId,
  activeTabId: controlledActiveTabId,
  onTabChange,
  actions,
  ariaLabel = "מידע מוצר",
}: TabsProps) {
  const fallbackId = useId();
  const tablistId = `${fallbackId}-tablist`;
  const [internalActiveTabId, setInternalActiveTabId] = useState(
    initialTabId ?? defaultTabId ?? items[0]?.id ?? "",
  );
  const isControlled = controlledActiveTabId !== undefined;
  const activeTabId = isControlled
    ? controlledActiveTabId
    : internalActiveTabId;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalActiveTabId(tabId);
      }
      onTabChange?.(tabId);
    },
    [isControlled, onTabChange],
  );

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (items.length <= 1) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? -1 : 1;
      const nextIndex = getNextTabIndex(index, direction, items.length);
      const nextTab = items[nextIndex];
      if (nextTab) {
        selectTab(nextTab.id);
        tabRefs.current[nextIndex]?.focus();
      }
    }

    if (event.key === "Home") {
      event.preventDefault();
      const firstTab = items[0];
      if (firstTab) {
        selectTab(firstTab.id);
        tabRefs.current[0]?.focus();
      }
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTab = items[items.length - 1];
      if (lastTab) {
        selectTab(lastTab.id);
        tabRefs.current[items.length - 1]?.focus();
      }
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div
          id={tablistId}
          role="tablist"
          aria-label={ariaLabel}
          className={styles.tablist}
        >
          {items.map((item, index) => {
            const isSelected = item.id === activeTabId;

            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${fallbackId}-tab-${item.id}`}
                aria-selected={isSelected}
                aria-controls={`${fallbackId}-panel-${item.id}`}
                aria-label={
                  item.hasError ? `${item.label} — יש שגיאות בשדות` : undefined
                }
                tabIndex={isSelected ? 0 : -1}
                className={
                  isSelected
                    ? item.hasError
                      ? styles.tabActiveError
                      : styles.tabActive
                    : item.hasError
                      ? styles.tabError
                      : styles.tab
                }
                onClick={() => selectTab(item.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {item.label}
                {item.hasError ? (
                  <span className={styles.errorIndicator} aria-hidden="true">
                    *
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {items.map((item) => {
        const isSelected = item.id === activeTabId;

        return (
          <div
            key={item.id}
            role="tabpanel"
            id={`${fallbackId}-panel-${item.id}`}
            aria-labelledby={`${fallbackId}-tab-${item.id}`}
            hidden={!isSelected}
            className={styles.panel}
          >
            {item.panel}
          </div>
        );
      })}
    </div>
  );
}
