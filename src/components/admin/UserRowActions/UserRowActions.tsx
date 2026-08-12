"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import {
  updateUserActiveStatusAction,
  updateUserRoleAction,
} from "@/app/admin/users/actions";
import type { AdminUserListItem } from "@/types/admin-user";
import { USER_ROLE_LABELS } from "@/types/admin-user";
import type { UserRole } from "@/types/user";
import styles from "./UserRowActions.module.scss";

type UserRowActionsProps = {
  user: AdminUserListItem;
  layout?: "table" | "card";
};

const ROLE_OPTIONS: UserRole[] = ["customer", "professional", "admin"];

export default function UserRowActions({
  user,
  layout = "table",
}: UserRowActionsProps) {
  const router = useRouter();
  const roleSelectId = useId();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleUpdate = () => {
    setError(null);
    setSuccess(null);

    if (selectedRole === user.role) {
      return;
    }

    if (
      selectedRole === "admin" &&
      !window.confirm("להפוך משתמש זה לאדמין?")
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, selectedRole);

      if (result.error) {
        setError(result.error);
        setSelectedRole(user.role);
        return;
      }

      setSuccess("התפקיד עודכן.");
      router.refresh();
    });
  };

  const handleActiveToggle = () => {
    setError(null);
    setSuccess(null);

    const nextActive = !user.isActive;

    if (
      !nextActive &&
      !window.confirm("האם להשבית את המשתמש?")
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateUserActiveStatusAction(user.id, nextActive);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(nextActive ? "המשתמש הופעל." : "המשתמש הושבת.");
      router.refresh();
    });
  };

  const roleControls = (
    <div className={styles.roleGroup}>
      <label className={styles.roleLabel} htmlFor={roleSelectId}>
        תפקיד
      </label>
      <select
        id={roleSelectId}
        className={styles.select}
        value={selectedRole}
        disabled={isPending}
        onChange={(event) =>
          setSelectedRole(event.target.value as UserRole)
        }
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {USER_ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={isPending || selectedRole === user.role}
        onClick={handleRoleUpdate}
      >
        עדכון תפקיד
      </button>
    </div>
  );

  const activeControl = (
    <button
      type="button"
      className={user.isActive ? styles.dangerButton : styles.successButton}
      disabled={isPending}
      onClick={handleActiveToggle}
    >
      {user.isActive ? "השבתת משתמש" : "הפעלת משתמש"}
    </button>
  );

  return (
    <div className={layout === "card" ? styles.cardActions : styles.actions}>
      {roleControls}
      {activeControl}
      {error ? (
        <p className={styles.messageError} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className={styles.messageSuccess} role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
