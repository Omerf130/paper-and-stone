"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { searchClientsForCrmAction } from "@/app/admin/clients/actions";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import type { ClientLookupItem } from "@/lib/admin/clients/client-lookup-queries";
import styles from "@/components/admin/project-detail/AdminClientPicker/AdminClientPicker.module.scss";

type AdminCrmClientPickerProps = {
  selectedClientId?: string | null;
  selectedClientLabel?: string | null;
  onSelect: (client: ClientLookupItem) => void;
  disabled?: boolean;
};

export default function AdminCrmClientPicker({
  selectedClientId,
  selectedClientLabel,
  onSelect,
  disabled = false,
}: AdminCrmClientPickerProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientLookupItem[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await searchClientsForCrmAction(query);
      setClients(result.clients);
    });
  }, [query]);

  return (
    <div className={styles.wrap}>
      <FormField label="חיפוש לקוח" htmlFor={searchId}>
        <input
          id={searchId}
          type="search"
          className={formFieldStyles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="שם מלא, אימייל או מזהה"
          disabled={disabled || isPending}
          aria-describedby="crm-client-picker-help"
        />
      </FormField>

      <p id="crm-client-picker-help" className={styles.help}>
        {selectedClientLabel
          ? `נבחר: ${selectedClientLabel}`
          : "בחרו לקוח פעיל ומאושר מהרשימה"}
      </p>

      <ul className={styles.list} aria-label="תוצאות חיפוש לקוחות">
        {clients.length === 0 ? (
          <li className={styles.empty}>
            {isPending ? "מחפש..." : "לא נמצאו לקוחות"}
          </li>
        ) : (
          clients.map((client) => {
            const isSelected = selectedClientId === client.id;

            return (
              <li key={client.id}>
                <button
                  type="button"
                  className={isSelected ? styles.optionSelected : styles.option}
                  onClick={() => onSelect(client)}
                  disabled={disabled}
                >
                  <span className={styles.optionName}>
                    {client.fullName ?? "ללא שם"}
                  </span>
                  <span className={styles.optionEmail} dir="ltr">
                    {client.email}
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
