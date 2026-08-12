"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/professional/projects/actions";
import type { ProjectFormInput, ProjectFormState } from "@/types/project";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialProject: ProjectFormInput;
  projectId?: string;
  showSavedBanner?: boolean;
  showDelete?: boolean;
};

const initialState: ProjectFormState = {};

export default function ProjectForm({
  mode,
  initialProject,
  projectId,
  showSavedBanner = false,
  showDelete = false,
}: ProjectFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [project, setProject] = useState(initialProject);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

  const updateField = <K extends keyof ProjectFormInput>(
    key: K,
    value: ProjectFormInput[K],
  ) => {
    setProject((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(project)
          : await updateProjectAction(projectId ?? "", project);

      setFormState(result);

      if (result.success) {
        setSavedBanner(true);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!projectId) {
      return;
    }

    if (!window.confirm("למחוק את הפרויקט? פעולה זו אינה ניתנת לביטול.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      setFormState(result);
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      {(savedBanner || showSavedBanner) && (
        <p className={styles.formSuccess} role="status">
          הפרויקט נשמר בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי פרויקט</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="project-name" className={styles.label}>
              שם פרויקט
            </label>
            <input
              id="project-name"
              name="name"
              type="text"
              className={styles.input}
              value={project.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
            {fieldErrors.name && (
              <p className={styles.fieldError}>{fieldErrors.name}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="client-name" className={styles.label}>
              שם לקוח
            </label>
            <input
              id="client-name"
              name="clientName"
              type="text"
              className={styles.input}
              value={project.clientName ?? ""}
              onChange={(event) => updateField("clientName", event.target.value)}
            />
            {fieldErrors.clientName && (
              <p className={styles.fieldError}>{fieldErrors.clientName}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="location" className={styles.label}>
              מיקום
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className={styles.input}
              value={project.location ?? ""}
              onChange={(event) => updateField("location", event.target.value)}
            />
            {fieldErrors.location && (
              <p className={styles.fieldError}>{fieldErrors.location}</p>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            תיאור
          </label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            value={project.description ?? ""}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
          />
          {fieldErrors.description && (
            <p className={styles.fieldError}>{fieldErrors.description}</p>
          )}
        </div>
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "שומר..." : mode === "create" ? "יצירת פרויקט" : "שמירה"}
        </button>
        {mode === "edit" ? (
          <Link href="/professional/projects" className={styles.cancelLink}>
            חזרה לרשימה
          </Link>
        ) : null}
        {showDelete ? (
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleDelete}
            disabled={isPending}
          >
            מחיקת פרויקט
          </button>
        ) : null}
      </div>
    </div>
  );
}
