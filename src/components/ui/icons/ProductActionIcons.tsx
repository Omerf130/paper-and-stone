import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function HeartIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 20.25s-7.5-4.35-7.5-10.1a4.1 4.1 0 0 1 7.5-2.3 4.1 4.1 0 0 1 7.5 2.3c0 5.75-7.5 10.1-7.5 10.1z" />
    </svg>
  );
}

export function HeartFilledIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 20.25s-7.5-4.35-7.5-10.1a4.1 4.1 0 0 1 7.5-2.3 4.1 4.1 0 0 1 7.5 2.3c0 5.75-7.5 10.1-7.5 10.1z" />
    </svg>
  );
}

export function DownloadIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 3v10" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </svg>
  );
}
