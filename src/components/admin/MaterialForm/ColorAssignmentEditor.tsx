"use client";

import Link from "next/link";
import type { AdminColorOption } from "@/types/admin-material";
import HexPreview from "../ColorForm/HexPreview";
import styles from "../ProductForm/form-section.module.scss";

type ColorAssignmentEditorProps = {
  activeColors: AdminColorOption[];
  linkedInactiveColors: AdminColorOption[];
  selectedColorIds: string[];
  onChange: (colorIds: string[]) => void;
  fieldError?: string;
};

export default function ColorAssignmentEditor({
  activeColors,
  linkedInactiveColors,
  selectedColorIds,
  onChange,
  fieldError,
}: ColorAssignmentEditorProps) {
  const toggleColor = (colorId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedColorIds, colorId]);
      return;
    }

    onChange(selectedColorIds.filter((id) => id !== colorId));
  };

  return (
    <div className={styles.subsection}>
      <p className={styles.subheading}>צבעים זמינים לחומר</p>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit" }}>
        בחרו צבעים מהספרייה המרכזית — אין ליצור צבעים כפולים כאן.
      </p>

      {linkedInactiveColors.length > 0 ? (
        <ul className={styles.stack}>
          {linkedInactiveColors.map((color) => (
            <li key={color.id} className={styles.checkboxLabel}>
              <input type="checkbox" checked disabled readOnly />
              {color.hex ? <HexPreview hex={color.hex} size="sm" /> : null}
              <span>
                {color.name} (לא פעיל)
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {activeColors.length > 0 ? (
        <ul className={styles.stack}>
          {activeColors.map((color) => (
            <li key={color.id}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedColorIds.includes(color.id)}
                  onChange={(event) =>
                    toggleColor(color.id, event.target.checked)
                  }
                />
                {color.hex ? <HexPreview hex={color.hex} size="sm" /> : null}
                <span>{color.name}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit" }}>
          אין צבעים פעילים בספרייה.{" "}
          <Link href="/admin/materials">ניהול חומרים</Link>
        </p>
      )}

      {fieldError ? <p className={styles.fieldError}>{fieldError}</p> : null}
    </div>
  );
}
