"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProjectItemWorkflowSettingsAction } from "@/app/admin/settings/project-item-workflow/actions";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import { DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS } from "@/lib/project-items/project-item-workflow-defaults";
import type {
  ProjectItemWorkflowSettingsView,
  ProjectItemWorkflowTransition,
  ProjectItemWorkflowTransitionRole,
} from "@/types/project-item-status";
import styles from "./ProjectItemWorkflowSettingsForm.module.scss";

type ProjectItemWorkflowSettingsFormProps = {
  initialSettings: ProjectItemWorkflowSettingsView;
  documentExists: boolean;
};

function toggleRole(
  transition: ProjectItemWorkflowTransition,
  role: ProjectItemWorkflowTransitionRole,
): ProjectItemWorkflowTransition {
  const hasRole = transition.allowedRoles.includes(role);

  return {
    ...transition,
    allowedRoles: hasRole
      ? transition.allowedRoles.filter((value) => value !== role)
      : [...transition.allowedRoles, role],
  };
}

export default function ProjectItemWorkflowSettingsForm({
  initialSettings,
  documentExists,
}: ProjectItemWorkflowSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transitions, setTransitions] = useState(initialSettings.transitions);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (
    index: number,
    role: ProjectItemWorkflowTransitionRole,
  ) => {
    setTransitions((current) =>
      current.map((transition, transitionIndex) =>
        transitionIndex === index ? toggleRole(transition, role) : transition,
      ),
    );
  };

  const handleResetDefaults = () => {
    setTransitions(structuredClone(DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS));
  };

  const handleSubmit = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await updateProjectItemWorkflowSettingsAction({ transitions });

      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הגדרות תהליך הסטטוס נשמרו." });
      router.refresh();
    });
  };

  return (
    <div className={styles.stack}>
      {!documentExists ? (
        <p className={styles.banner} role="status">
          ההגדרות הנוכחיות מבוססות על ברירת המחדל. שמירה תיצור מסמך הגדרות במערכת.
        </p>
      ) : null}

      <p className={styles.note}>
        מנהל המערכת יכול לעקוף כל סטטוס ישירות ממרחב הפרויקט. כאן מגדירים רק
        מעברים מותרים לאדריכל וללקוח.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">מסטטוס</th>
              <th scope="col">לסטטוס</th>
              <th scope="col">אדריכל</th>
              <th scope="col">לקוח</th>
            </tr>
          </thead>
          <tbody>
            {transitions.map((transition, index) => (
              <tr key={`${transition.from}-${transition.to}`}>
                <td>{getProjectItemStatusPresentation(transition.from, "admin").label}</td>
                <td>{getProjectItemStatusPresentation(transition.to, "admin").label}</td>
                <td className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={transition.allowedRoles.includes("architect")}
                    aria-label={`אדריכל: ${transition.from} → ${transition.to}`}
                    onChange={() => handleToggle(index, "architect")}
                    disabled={isPending}
                  />
                </td>
                <td className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={transition.allowedRoles.includes("client")}
                    aria-label={`לקוח: ${transition.from} → ${transition.to}`}
                    onChange={() => handleToggle(index, "client")}
                    disabled={isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={isPending}
          loadingLabel="שומר..."
          disabled={isPending}
        >
          שמירה
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetDefaults}
          disabled={isPending}
        >
          שחזור ברירת מחדל
        </Button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
