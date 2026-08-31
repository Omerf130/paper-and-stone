"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button/Button";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { ADMIN_CREATE_USER_LIMITATION } from "@/lib/admin/crm/admin-create-user-validation";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type AdminCreateUserFormValues = {
  fullName: string;
  email: string;
  identificationNumber: string;
  initialPassword: string;
  initialPasswordConfirm: string;
};

type AdminCreateUserFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type AdminCreateUserSuccess = {
  success: true;
  userId: string;
};

type AdminCreateUserFailure = {
  error: string;
  fieldErrors?: Record<string, string>;
};

type AdminCreateUserFormProps = {
  title: string;
  submitLabel: string;
  successRedirectPath: string;
  onSubmit: (input: AdminCreateUserFormValues) => Promise<
    AdminCreateUserSuccess | AdminCreateUserFailure
  >;
};

const emptyValues: AdminCreateUserFormValues = {
  fullName: "",
  email: "",
  identificationNumber: "",
  initialPassword: "",
  initialPasswordConfirm: "",
};

export default function AdminCreateUserForm({
  title,
  submitLabel,
  successRedirectPath,
  onSubmit,
}: AdminCreateUserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = useState(emptyValues);
  const [formState, setFormState] = useState<AdminCreateUserFormState>({});
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof AdminCreateUserFormValues>(
    key: K,
    value: AdminCreateUserFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState({});

    startTransition(async () => {
      const result = await onSubmit(values);

      if ("fieldErrors" in result && result.fieldErrors) {
        setFormState({ fieldErrors: result.fieldErrors });
        return;
      }

      if ("error" in result) {
        toast({ type: "error", message: result.error });
        setFormState({ error: result.error });
        return;
      }

      toast({ type: "success", message: "המשתמש נוצר בהצלחה" });
      const redirectPath = successRedirectPath.includes("[id]")
        ? successRedirectPath.replace("[id]", result.userId)
        : `${successRedirectPath}/${result.userId}`;
      router.push(redirectPath);
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <FeedbackBanner tone="info">{ADMIN_CREATE_USER_LIMITATION}</FeedbackBanner>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם מלא"
            htmlFor="create-user-fullName"
            error={fieldErrors.fullName}
          >
            <input
              id="create-user-fullName"
              className={formFieldStyles.input}
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
          </FormField>

          <FormField
            label="אימייל"
            htmlFor="create-user-email"
            error={fieldErrors.email}
          >
            <input
              id="create-user-email"
              type="email"
              className={formFieldStyles.input}
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              dir="ltr"
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </FormField>

          <FormField
            label="ח.פ / ת.ז"
            htmlFor="create-user-identificationNumber"
            error={fieldErrors.identificationNumber}
          >
            <input
              id="create-user-identificationNumber"
              className={formFieldStyles.input}
              value={values.identificationNumber}
              onChange={(event) =>
                updateField("identificationNumber", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.identificationNumber)}
            />
          </FormField>

          <FormField
            label="סיסמה ראשונית"
            htmlFor="create-user-initialPassword"
            error={fieldErrors.initialPassword}
          >
            <input
              id="create-user-initialPassword"
              type="password"
              className={formFieldStyles.input}
              value={values.initialPassword}
              onChange={(event) =>
                updateField("initialPassword", event.target.value)
              }
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.initialPassword)}
            />
          </FormField>

          <FormField
            label="אימות סיסמה"
            htmlFor="create-user-initialPasswordConfirm"
            error={fieldErrors.initialPasswordConfirm}
          >
            <input
              id="create-user-initialPasswordConfirm"
              type="password"
              className={formFieldStyles.input}
              value={values.initialPasswordConfirm}
              onChange={(event) =>
                updateField("initialPasswordConfirm", event.target.value)
              }
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.initialPasswordConfirm)}
            />
          </FormField>
        </div>
      </section>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="יוצר..." size="sm">
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
