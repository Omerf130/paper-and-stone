import Link from "next/link";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "text";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  preview?: false;
};

type ButtonAsPreview = ButtonBaseProps & {
  preview: true;
  href?: never;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: never;
  preview?: false;
};

type ButtonProps = ButtonAsLink | ButtonAsPreview | ButtonAsButton;

function getVariantClass(variant: ButtonVariant, preview: boolean): string {
  if (preview) {
    return variant === "primary"
      ? styles.previewPrimary
      : styles.previewSecondary;
  }

  switch (variant) {
    case "secondary":
      return styles.secondary;
    case "text":
      return styles.text;
    default:
      return styles.primary;
  }
}

export default function Button({
  variant = "primary",
  href,
  preview = false,
  disabled = false,
  className,
  children,
}: ButtonProps) {
  const variantClass = getVariantClass(variant, preview);
  const classes = [variantClass, disabled ? styles.disabled : "", className]
    .filter(Boolean)
    .join(" ");

  if (preview) {
    return (
      <span className={classes} aria-hidden="true">
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
