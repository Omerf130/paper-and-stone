"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectMessageActionState } from "@/types/project-message";
import { MESSAGE_BODY_MAX } from "@/lib/project-messages/message-validation";
import styles from "./ProjectMessageForm.module.scss";

type ProjectMessageFormProps = {
  projectId: string;
  sendAction: (
    projectId: string,
    body: string,
  ) => Promise<ProjectMessageActionState>;
  disabled?: boolean;
  variant?: "default" | "admin";
};

export default function ProjectMessageForm({
  projectId,
  sendAction,
  disabled = false,
  variant = "default",
}: ProjectMessageFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const fieldErrorId = `message-body-error-${projectId}`;

  const handleSubmit = () => {
    setFieldError(undefined);

    startTransition(async () => {
      const result = await sendAction(projectId, body);

      if (result.fieldErrors?.body) {
        setFieldError(result.fieldErrors.body);
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      setBody("");
      toast({ type: "success", message: "ההודעה נשלחה" });
      router.refresh();
    });
  };

  return (
    <div
      className={
        variant === "admin" ? `${styles.form} ${styles.admin}` : styles.form
      }
    >
      <FormField
        label="הודעה"
        htmlFor={`message-body-${projectId}`}
        error={fieldError}
        errorId={fieldErrorId}
      >
        <textarea
          id={`message-body-${projectId}`}
          className={formFieldStyles.textarea}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          maxLength={MESSAGE_BODY_MAX}
          disabled={disabled || isPending}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? fieldErrorId : undefined}
        />
      </FormField>

      <Button
        onClick={handleSubmit}
        disabled={disabled}
        loading={isPending}
        loadingLabel="שולח..."
      >
        שליחת הודעה
      </Button>
    </div>
  );
}
