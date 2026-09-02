"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ProjectPickerOptionView } from "@/types/project";
import styles from "./add-to-project-picker.module.scss";

function ProjectPlaceholderIcon() {
  return (
    <span className={styles.placeholderIcon} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1" />
        <path d="M5 8h6M5 10.5h3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function formatProjectSecondary(project: ProjectPickerOptionView): string {
  return [project.location, project.statusLabel, project.clientName]
    .filter(Boolean)
    .join(" · ");
}

type AddToProjectProjectPickerProps = {
  options: ProjectPickerOptionView[];
  selectedId: string;
  onSelect: (projectId: string) => void;
  disabled?: boolean;
};

export default function AddToProjectProjectPicker({
  options,
  selectedId,
  onSelect,
  disabled = false,
}: AddToProjectProjectPickerProps) {
  const listboxId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId) ?? null;

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

  return (
    <div className={styles.field}>
      <p className={styles.label} id={`${listboxId}-label`}>
        פרויקט
      </p>
      <div className={styles.wrap} ref={wrapRef}>
        <button
          type="button"
          className={open ? styles.triggerOpen : styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${listboxId}-label`}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
        >
          <ProjectPlaceholderIcon />
          <span className={styles.triggerBody}>
            {selected ? (
              <>
                <span className={styles.triggerPrimary}>{selected.name}</span>
                {formatProjectSecondary(selected) ? (
                  <span className={styles.triggerSecondary}>
                    {formatProjectSecondary(selected)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className={styles.triggerPlaceholder}>בחרו פרויקט</span>
            )}
          </span>
          <span className={styles.chevron} aria-hidden="true">
            ▾
          </span>
        </button>

        {open ? (
          <div className={styles.panel} role="listbox" id={listboxId}>
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              const secondary = formatProjectSecondary(option);

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
                  <ProjectPlaceholderIcon />
                  <span className={styles.optionBody}>
                    <span className={styles.optionPrimary}>{option.name}</span>
                    {secondary ? (
                      <span className={styles.optionSecondary}>{secondary}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
