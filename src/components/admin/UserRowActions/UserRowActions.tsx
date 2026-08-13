"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import {
  updateUserActiveStatusAction,
  updateUserRoleAction,
} from "@/app/admin/users/actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminUserListItem } from "@/types/admin-user";
import { USER_ROLE_LABELS } from "@/types/admin-user";
import type { UserRole } from "@/types/user";
import styles from "./UserRowActions.module.scss";

type UserRowActionsProps = {
  user: AdminUserListItem;
  layout?: "table" | "card";
};

const ROLE_OPTIONS: UserRole[] = ["customer", "professional", "admin"];

type PendingAction = "promote" | "deactivate" | null;

export default function UserRowActions({
  user,
  layout = "table",
}: UserRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const roleSelectId = useId();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleUpdate = () => {
    if (selectedRole === user.role) {
      return;
    }

    if (selectedRole === "admin") {
      setPendingAction("promote");
      return;
    }

    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, selectedRole);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setSelectedRole(user.role);
        return;
      }

      toast({ type: "success", message: "התפקיד עודכן." });
      router.refresh();
    });
  };

  const confirmRoleUpdate = () => {
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, selectedRole);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setSelectedRole(user.role);
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "התפקיד עודכן." });
      setPendingAction(null);
      router.refresh();
    });
  };

  const handleActiveToggle = () => {
    const nextActive = !user.isActive;

    if (!nextActive) {
      setPendingAction("deactivate");
      return;
    }

    startTransition(async () => {
      const result = await updateUserActiveStatusAction(user.id, nextActive);

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "המשתמש הופעל." });
      router.refresh();
    });
  };

  const confirmDeactivation = () => {
    startTransition(async () => {
      const result = await updateUserActiveStatusAction(user.id, false);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "המשתמש הושבת." });
      setPendingAction(null);
      router.refresh();
    });
  };

  const roleControls = (
    <div className={styles.roleGroup}>
      <FormField label="תפקיד" htmlFor={roleSelectId}>
        <select
          id={roleSelectId}
          className={formFieldStyles.input}
          value={selectedRole}
          disabled={isPending}
          onChange={(event) => setSelectedRole(event.target.value as UserRole)}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </FormField>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending || selectedRole === user.role}
        loading={isPending && pendingAction === null}
        loadingLabel="מעדכן..."
        onClick={handleRoleUpdate}
      >
        עדכון תפקיד
      </Button>
    </div>
  );

  const activeControl = (
    <Button
      type="button"
      variant={user.isActive ? "danger" : "secondary"}
      size="sm"
      disabled={isPending}
      loading={isPending && pendingAction === null}
      loadingLabel={user.isActive ? "משבית..." : "מפעיל..."}
      onClick={handleActiveToggle}
    >
      {user.isActive ? "השבתת משתמש" : "הפעלת משתמש"}
    </Button>
  );

  return (
    <>
      <div className={layout === "card" ? styles.cardActions : styles.actions}>
        {roleControls}
        {activeControl}
      </div>

      <ConfirmDialog
        open={pendingAction === "promote"}
        title="הפיכה לאדמין"
        description="להפוך משתמש זה לאדמין?"
        confirmLabel="אישור"
        tone="default"
        loading={isPending}
        onConfirm={confirmRoleUpdate}
        onCancel={() => {
          setPendingAction(null);
          setSelectedRole(user.role);
        }}
      />

      <ConfirmDialog
        open={pendingAction === "deactivate"}
        title="השבתת משתמש"
        description="האם להשבית את המשתמש?"
        confirmLabel="השבתה"
        tone="danger"
        loading={isPending}
        onConfirm={confirmDeactivation}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
