"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/lib/auth/validation";
import { USER_TYPE_LABELS } from "@/types/admin-user";
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
        <label className={authFormStyles.label} htmlFor="register-full-name">
          שם מלא
        </label>
        <input
          id="register-full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={
            state.fieldErrors?.fullName ? "register-full-name-error" : undefined
          }
        />
        {state.fieldErrors?.fullName && (
          <p id="register-full-name-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.fullName}
          </p>
        )}
      </div>

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

      <div className={authFormStyles.field}>
        <label
          className={authFormStyles.label}
          htmlFor="register-identification-number"
        >
          ח.פ / ת.ז
        </label>
        <input
          id="register-identification-number"
          name="identificationNumber"
          type="text"
          autoComplete="off"
          required
          className={authFormStyles.input}
          aria-invalid={Boolean(state.fieldErrors?.identificationNumber)}
          aria-describedby={
            state.fieldErrors?.identificationNumber
              ? "register-identification-number-error"
              : undefined
          }
        />
        {state.fieldErrors?.identificationNumber && (
          <p
            id="register-identification-number-error"
            className={authFormStyles.fieldError}
          >
            {state.fieldErrors.identificationNumber}
          </p>
        )}
      </div>

      <div className={authFormStyles.field}>
        <label className={authFormStyles.label} htmlFor="register-user-type">
          סוג משתמש
        </label>
        <select
          id="register-user-type"
          name="userType"
          required
          className={authFormStyles.input}
          defaultValue=""
          aria-invalid={Boolean(state.fieldErrors?.userType)}
          aria-describedby={
            state.fieldErrors?.userType ? "register-user-type-error" : undefined
          }
        >
          <option value="" disabled>
            בחרו סוג משתמש
          </option>
          <option value="client">{USER_TYPE_LABELS.client}</option>
          <option value="architect">{USER_TYPE_LABELS.architect}</option>
        </select>
        <p className={styles.userTypeHint}>
          בחירה ב&quot;אדריכל&quot; יוצרת חשבון לקוח עם גישה לאזור הלקוח. הרשאת
          אדריכל תופעל לאחר אישור מנהל המערכת.
        </p>
        {state.fieldErrors?.userType && (
          <p id="register-user-type-error" className={authFormStyles.fieldError}>
            {state.fieldErrors.userType}
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
