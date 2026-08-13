import Link from "next/link";
import SpinnerIcon from "@/components/ui/icons/SpinnerIcon";
import styles from "./Button.module.scss";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "text";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
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
  type?: "button" | "submit";
  onClick?: () => void;
};

export type ButtonProps = ButtonAsLink | ButtonAsPreview | ButtonAsButton;

function getVariantClass(variant: ButtonVariant, preview: boolean): string {
  if (preview) {
    return variant === "primary" || variant === "danger"
      ? styles.previewPrimary
      : styles.previewSecondary;
  }

  switch (variant) {
    case "secondary":
      return styles.secondary;
    case "ghost":
      return styles.ghost;
    case "danger":
      return styles.danger;
    case "text":
      return styles.text;
    default:
      return styles.primary;
  }
}

function getSizeClass(size: ButtonSize): string {
  switch (size) {
    case "sm":
      return styles.sm;
    case "lg":
      return styles.lg;
    default:
      return styles.md;
  }
}

export default function Button({
  variant = "primary",
  size = "md",
  href,
  preview = false,
  disabled = false,
  loading = false,
  loadingLabel,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantClass = getVariantClass(variant, preview);
  const classes = [
    variantClass,
    getSizeClass(size),
    loading ? styles.loading : "",
    fullWidth ? styles.fullWidth : "",
    isDisabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label = loading && loadingLabel ? loadingLabel : children;

  const content = (
    <>
      {loading ? <SpinnerIcon /> : null}
      <span>{label}</span>
    </>
  );

  if (preview) {
    return (
      <span className={classes} aria-hidden="true">
        {content}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} aria-busy={loading || undefined}>
        {content}
      </Link>
    );
  }

  const { type = "button", onClick } = rest as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
