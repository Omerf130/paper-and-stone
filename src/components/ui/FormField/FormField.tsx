import styles from "./form-field.module.scss";

type FieldErrorProps = {
  id?: string;
  message: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <p id={id} className={styles.error} role="alert">
      {message}
    </p>
  );
}

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  errorId,
  children,
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  );
}

export { styles as formFieldStyles };
