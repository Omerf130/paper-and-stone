"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { searchArchitectsForCrmAction } from "@/app/admin/architects/actions";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import type { ArchitectLookupItem } from "@/lib/admin/architects/architect-lookup-queries";
import styles from "@/components/admin/project-detail/AdminClientPicker/AdminClientPicker.module.scss";

type AdminCrmArchitectPickerProps = {
  selectedArchitectId?: string | null;
  selectedArchitectLabel?: string | null;
  onSelect: (architect: ArchitectLookupItem) => void;
  disabled?: boolean;
};

function formatArchitectLabel(architect: ArchitectLookupItem): string {
  const name = architect.fullName ?? architect.email;
  return architect.companyName ? `${name} · ${architect.companyName}` : name;
}

export default function AdminCrmArchitectPicker({
  selectedArchitectId,
  selectedArchitectLabel,
  onSelect,
  disabled = false,
}: AdminCrmArchitectPickerProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [architects, setArchitects] = useState<ArchitectLookupItem[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await searchArchitectsForCrmAction(query);
      setArchitects(result.architects);
    });
  }, [query]);

  return (
    <div className={styles.wrap}>
      <FormField label="חיפוש אדריכל" htmlFor={searchId}>
        <input
          id={searchId}
          type="search"
          className={formFieldStyles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="שם, אימייל, חברה או מזהה"
          disabled={disabled || isPending}
          aria-describedby="crm-architect-picker-help"
        />
      </FormField>

      <p id="crm-architect-picker-help" className={styles.help}>
        {selectedArchitectLabel
          ? `נבחר: ${selectedArchitectLabel}`
          : "בחרו אדריכל פעיל ומאושר מהרשימה"}
      </p>

      <ul className={styles.list} aria-label="תוצאות חיפוש אדריכלים">
        {architects.length === 0 ? (
          <li className={styles.empty}>
            {isPending ? "מחפש..." : "לא נמצאו אדריכלים"}
          </li>
        ) : (
          architects.map((architect) => {
            const isSelected = selectedArchitectId === architect.id;

            return (
              <li key={architect.id}>
                <button
                  type="button"
                  className={isSelected ? styles.optionSelected : styles.option}
                  onClick={() => onSelect(architect)}
                  disabled={disabled}
                >
                  <span className={styles.optionName}>
                    {architect.fullName ?? "ללא שם"}
                  </span>
                  {architect.companyName ? (
                    <span className={styles.optionEmail}>{architect.companyName}</span>
                  ) : null}
                  <span className={styles.optionEmail} dir="ltr">
                    {architect.email}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export { formatArchitectLabel };
