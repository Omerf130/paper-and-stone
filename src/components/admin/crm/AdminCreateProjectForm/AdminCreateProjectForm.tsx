"use client";

import { useEffect, useState, useTransition } from "react";
import { getArchitectLookupAction } from "@/app/admin/architects/actions";
import { createProjectAsAdminAction } from "@/app/admin/projects/crm-actions";
import AdminCrmArchitectPicker, {
  formatArchitectLabel,
} from "@/components/admin/crm/AdminCrmArchitectPicker/AdminCrmArchitectPicker";
import AdminCrmClientPicker from "@/components/admin/crm/AdminCrmClientPicker/AdminCrmClientPicker";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ArchitectLookupItem } from "@/lib/admin/architects/architect-lookup-queries";
import type { ClientLookupItem } from "@/lib/admin/clients/client-lookup-queries";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type AdminCreateProjectFormProps = {
  initialArchitectId?: string;
  initialClientId?: string;
  preselectedArchitect?: ArchitectLookupItem | null;
  preselectedClient?: ClientLookupItem | null;
};

type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function formatClientLabel(client: ClientLookupItem): string {
  return client.fullName ? `${client.fullName} (${client.email})` : client.email;
}

export default function AdminCreateProjectForm({
  initialArchitectId,
  initialClientId,
  preselectedArchitect = null,
  preselectedClient = null,
}: AdminCreateProjectFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [architect, setArchitect] = useState<ArchitectLookupItem | null>(
    preselectedArchitect,
  );
  const [client, setClient] = useState<ClientLookupItem | null>(preselectedClient);
  const [formState, setFormState] = useState<FormState>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (preselectedArchitect || !initialArchitectId) {
      return;
    }

    startTransition(async () => {
      const result = await getArchitectLookupAction(initialArchitectId);
      if (result.architect) {
        setArchitect(result.architect);
      }
    });
  }, [initialArchitectId, preselectedArchitect]);

  const handleSubmit = () => {
    setFormState({});

    if (!architect) {
      toast({ type: "error", message: "נא לבחור אדריכל" });
      return;
    }

    if (!client) {
      toast({ type: "error", message: "נא לבחור לקוח" });
      return;
    }

    startTransition(async () => {
      const result = await createProjectAsAdminAction({
        name,
        location,
        description,
        ownerUserId: architect.id,
        clientUserId: client.id,
      });

      if (result?.error) {
        toast({ type: "error", message: result.error });
        setFormState({ error: result.error });
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי פרויקט</h2>
        <div className={styles.fieldGrid}>
          <FormField label="שם פרויקט" htmlFor="project-name" error={fieldErrors.name}>
            <input
              id="project-name"
              className={formFieldStyles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
          </FormField>

          <FormField label="מיקום" htmlFor="project-location" error={fieldErrors.location}>
            <input
              id="project-location"
              className={formFieldStyles.input}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              aria-invalid={Boolean(fieldErrors.location)}
            />
          </FormField>

          <div className={styles.fullWidth}>
            <FormField
              label="תיאור"
              htmlFor="project-description"
              error={fieldErrors.description}
            >
              <textarea
                id="project-description"
                className={formFieldStyles.textarea}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                aria-invalid={Boolean(fieldErrors.description)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>שיוך</h2>
        <div className={styles.fieldGrid}>
          <AdminCrmArchitectPicker
            selectedArchitectId={architect?.id}
            selectedArchitectLabel={
              architect ? formatArchitectLabel(architect) : null
            }
            onSelect={setArchitect}
            disabled={isPending}
          />
          <AdminCrmClientPicker
            selectedClientId={client?.id ?? initialClientId}
            selectedClientLabel={client ? formatClientLabel(client) : null}
            onSelect={setClient}
            disabled={isPending}
          />
        </div>
      </section>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="יוצר..." size="sm">
          יצירת פרויקט
        </Button>
      </div>
    </div>
  );
}
