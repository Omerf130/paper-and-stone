"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { RoomPickerOptionView } from "@/types/project";
import styles from "./add-to-project-picker.module.scss";

function RoomPlaceholderIcon() {
  return (
    <span className={styles.placeholderIcon} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2.5 12.5V6.5L8 3.5L13.5 6.5V12.5H2.5Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M6.5 12.5V9H9.5V12.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}

type AddToProjectRoomPickerProps = {
  options: RoomPickerOptionView[];
  selectedId: string;
  onSelect: (roomId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  projectId?: string;
  projectSelected?: boolean;
};

export default function AddToProjectRoomPicker({
  options,
  selectedId,
  onSelect,
  disabled = false,
  loading = false,
  projectId,
  projectSelected = false,
}: AddToProjectRoomPickerProps) {
  const listboxId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId) ?? null;
  const isDisabled = disabled || !projectSelected || loading;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const showEmptyState =
    projectSelected && !loading && options.length === 0 && projectId;

  return (
    <div className={styles.field}>
      <p className={styles.label} id={`${listboxId}-label`}>
        חדר
      </p>
      {showEmptyState ? (
        <p className={styles.emptyMessage}>
          לפרויקט זה אין חדרים.{" "}
          <Link href={`/professional/projects/${projectId}`} className={styles.emptyLink}>
            הוסיפו חדר בפרויקט
          </Link>
        </p>
      ) : (
        <div className={styles.wrap} ref={wrapRef}>
          <button
            type="button"
            className={open ? styles.triggerOpen : styles.trigger}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby={`${listboxId}-label`}
            disabled={isDisabled}
            onClick={() => setOpen((value) => !value)}
          >
            <RoomPlaceholderIcon />
            <span className={styles.triggerBody}>
              {loading ? (
                <span className={styles.triggerPlaceholder}>טוען חדרים...</span>
              ) : selected ? (
                <>
                  <span className={styles.triggerPrimary}>{selected.name}</span>
                  <span className={styles.triggerSecondary}>
                    {selected.itemCount} פריטים
                  </span>
                </>
              ) : (
                <span className={styles.triggerPlaceholder}>
                  {projectSelected ? "בחרו חדר" : "בחרו פרויקט תחילה"}
                </span>
              )}
            </span>
            <span className={styles.chevron} aria-hidden="true">
              ▾
            </span>
          </button>

          {open && !isDisabled ? (
            <div className={styles.panel} role="listbox" id={listboxId}>
              {options.map((option) => {
                const isSelected = option.id === selectedId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={isSelected ? styles.optionSelected : styles.option}
                    onClick={() => {
                      onSelect(option.id);
                      setOpen(false);
                    }}
                  >
                    <RoomPlaceholderIcon />
                    <span className={styles.optionBody}>
                      <span className={styles.optionPrimary}>{option.name}</span>
                      <span className={styles.optionSecondary}>
                        {option.itemCount} פריטים
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
