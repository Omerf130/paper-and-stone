"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/professional/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectFormInput, ProjectFormState } from "@/types/project";
import styles from "@/components/professional/professional-form.module.scss";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialProject: ProjectFormInput;
  projectId?: string;
  showDelete?: boolean;
  readOnly?: boolean;
  showClientName?: boolean;
};

const initialState: ProjectFormState = {};

export default function ProjectForm({
  mode,
  initialProject,
  projectId,
  showDelete = false,
  readOnly = false,
  showClientName = false,
}: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [project, setProject] = useState(initialProject);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateField = <K extends keyof ProjectFormInput>(
    key: K,
    value: ProjectFormInput[K],
  ) => {
    setProject((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(project)
          : await updateProjectAction(projectId ?? "", project);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הפרויקט נשמר" });
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!projectId) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      setFormState(result);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setDeleteDialogOpen(false);
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <>
      <div className={styles.stack}>
        <div className={styles.fieldGrid}>
          <FormField label="שם פרויקט" htmlFor="project-name" error={fieldErrors.name}>
            <input
              id="project-name"
              className={formFieldStyles.input}
              value={project.name}
              onChange={(event) => updateField("name", event.target.value)}
              readOnly={readOnly}
              disabled={readOnly}
              aria-invalid={Boolean(fieldErrors.name)}
            />
          </FormField>

          {showClientName ? (
            <FormField label="שם לקוח" htmlFor="client-name" error={fieldErrors.clientName}>
              <input
                id="client-name"
                className={formFieldStyles.input}
                value={project.clientName ?? ""}
                onChange={(event) => updateField("clientName", event.target.value)}
                readOnly={readOnly}
                disabled={readOnly}
                aria-invalid={Boolean(fieldErrors.clientName)}
              />
            </FormField>
          ) : null}

          <FormField label="מיקום" htmlFor="location" error={fieldErrors.location}>
            <input
              id="location"
              className={formFieldStyles.input}
              value={project.location ?? ""}
              onChange={(event) => updateField("location", event.target.value)}
              readOnly={readOnly}
              disabled={readOnly}
              aria-invalid={Boolean(fieldErrors.location)}
            />
          </FormField>

          <div className={styles.fullWidth}>
            <FormField label="תיאור" htmlFor="description" error={fieldErrors.description}>
              <textarea
                id="description"
                className={formFieldStyles.textarea}
                value={project.description ?? ""}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                readOnly={readOnly}
                disabled={readOnly}
                aria-invalid={Boolean(fieldErrors.description)}
              />
            </FormField>
          </div>
        </div>

        {!readOnly || mode === "edit" ? (
          <div className={styles.actions}>
            {!readOnly ? (
              <Button onClick={handleSubmit} loading={isPending} loadingLabel="שומר...">
                {mode === "create" ? "יצירת פרויקט" : "שמירה"}
              </Button>
            ) : null}
            {mode === "edit" ? (
              <Link href="/professional/projects" className={styles.cancelLink}>
                חזרה לרשימה
              </Link>
            ) : null}
            {showDelete && !readOnly ? (
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isPending}
              >
                מחיקת פרויקט
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="מחיקת פרויקט"
        description="למחוק את הפרויקט? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחיקה"
        tone="danger"
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
