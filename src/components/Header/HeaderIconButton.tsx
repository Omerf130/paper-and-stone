import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./HeaderIconButton.module.scss";

type HeaderIconButtonProps = {
  children: ReactNode;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function HeaderIconButton({
  children,
  label,
  className,
  ...props
}: HeaderIconButtonProps) {
  const classes = className ? `${styles.button} ${className}` : styles.button;

  return (
    <button type="button" className={classes} aria-label={label} {...props}>
      {children}
    </button>
  );
}
