"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
};

export default function ProjectMessageForm({
  projectId,
  sendAction,
  disabled = false,
}: ProjectMessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(undefined);
    setFieldError(undefined);

    startTransition(async () => {
      const result = await sendAction(projectId, body);

      if (result.fieldErrors?.body) {
        setFieldError(result.fieldErrors.body);
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      setBody("");
      router.refresh();
    });
  };

  return (
    <div className={styles.form}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <label className={styles.label} htmlFor={`message-body-${projectId}`}>
        הודעה
      </label>
      <textarea
        id={`message-body-${projectId}`}
        className={styles.textarea}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        maxLength={MESSAGE_BODY_MAX}
        disabled={disabled || isPending}
        aria-describedby={
          fieldError ? `message-body-error-${projectId}` : undefined
        }
      />
      {fieldError ? (
        <p
          id={`message-body-error-${projectId}`}
          className={styles.fieldError}
          role="alert"
        >
          {fieldError}
        </p>
      ) : null}

      <button
        type="button"
        className={styles.button}
        onClick={handleSubmit}
        disabled={disabled || isPending}
      >
        {isPending ? "שולח..." : "שליחת הודעה"}
      </button>
    </div>
  );
}
