"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/lib/auth/validation";
import authFormStyles from "@/components/auth/auth-form.module.scss";
import { loginAction } from "./actions";
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
      {pending ? "מתחברים..." : "התחברות"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className={authFormStyles.form} noValidate>
      {state.error && (
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <div className={authFormStyles.field}>
        <label className={authFormStyles.label} htmlFor="login-email">
          כתובת מייל
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "login-email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p id="login-email-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className={authFormStyles.field}>
        <label className={authFormStyles.label} htmlFor="login-password">
          סיסמה
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "login-password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p id="login-password-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <SubmitButton />

      <p className={styles.switch}>
        אין לכם חשבון?{" "}
        <Link href="/register" className={styles.switchLink}>
          הרשמה
        </Link>
      </p>
    </form>
  );
}
