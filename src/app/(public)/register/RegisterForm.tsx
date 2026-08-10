"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/lib/auth/validation";
import authFormStyles from "@/components/auth/auth-form.module.scss";
import { registerAction } from "./actions";
import styles from "./page.module.scss";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={authFormStyles.submit}
      disabled={pending}
    >
      {pending ? "נרשמים..." : "יצירת חשבון"}
    </button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className={authFormStyles.form} noValidate>
      {state.error && (
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <div className={authFormStyles.field}>
        <label className={authFormStyles.label} htmlFor="register-email">
          כתובת מייל
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "register-email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p id="register-email-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className={authFormStyles.field}>
        <label className={authFormStyles.label} htmlFor="register-password">
          סיסמה
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "register-password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p id="register-password-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div className={authFormStyles.field}>
        <label
          className={authFormStyles.label}
          htmlFor="register-password-confirm"
        >
          אימות סיסמה
        </label>
        <input
          id="register-password-confirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.passwordConfirm)}
          aria-describedby={
            state.fieldErrors?.passwordConfirm
              ? "register-password-confirm-error"
              : undefined
          }
        />
        {state.fieldErrors?.passwordConfirm && (
          <p
            id="register-password-confirm-error"
            className={authFormStyles.fieldError}
          >
            {state.fieldErrors.passwordConfirm}
          </p>
        )}
      </div>

      <SubmitButton />

      <p className={styles.switch}>
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className={styles.switchLink}>
          התחברות
        </Link>
      </p>
    </form>
  );
}
