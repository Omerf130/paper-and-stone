type IconProps = {
  className?: string;
};

type MetricIconBaseProps = IconProps & {
  children: React.ReactNode;
};

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.5 3.5L16.5 7.5L7 17H3V13L12.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 5L15 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6H16M7 6V4.5C7 3.67 7.67 3 8.5 3H11.5C12.33 3 13 3.67 13 4.5V6M8 9V14M12 9V14M5.5 6L6 16.5C6 17.33 6.67 18 7.5 18H12.5C13.33 18 14 17.33 14 16.5L14.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarCollapseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.5 5L7.5 10L12.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 5V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SidebarExpandIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 5V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetricIconBase({
  className,
  children,
}: MetricIconBaseProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MetricClientsIcon({ className }: IconProps) {
  return (
    <MetricIconBase className={className}>
      <path
        d="M5.5 7.5C6.88071 7.5 8 6.38071 8 5C8 3.61929 6.88071 2.5 5.5 2.5C4.11929 2.5 3 3.61929 3 5C3 6.38071 4.11929 7.5 5.5 7.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M1.5 13.5V12C1.5 10.067 3.067 8.5 5 8.5H6C7.933 8.5 9.5 10.067 9.5 12V13.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M10.5 7.5C11.6046 7.5 12.5 6.60457 12.5 5.5C12.5 4.39543 11.6046 3.5 10.5 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M12 13.5V12.5C12 11.1193 10.8807 10 9.5 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </MetricIconBase>
  );
}

export function MetricArchitectsIcon({ className }: IconProps) {
  return (
    <MetricIconBase className={className}>
      <path
        d="M8 8.5C9.933 8.5 11.5 6.933 11.5 5C11.5 3.067 9.933 1.5 8 1.5C6.067 1.5 4.5 3.067 4.5 5C4.5 6.933 6.067 8.5 8 8.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 14.5V13C2.5 10.5147 4.51472 8.5 7 8.5H9C11.4853 8.5 13.5 10.5147 13.5 13V14.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </MetricIconBase>
  );
}

export function MetricProjectsIcon({ className }: IconProps) {
  return (
    <MetricIconBase className={className}>
      <path
        d="M2.5 5.5L8 2.5L13.5 5.5V11.5L8 14.5L2.5 11.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M8 2.5V14.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2.5 5.5L13.5 5.5" stroke="currentColor" strokeWidth="1.25" />
    </MetricIconBase>
  );
}

export function MetricProductsIcon({ className }: IconProps) {
  return (
    <MetricIconBase className={className}>
      <path
        d="M2.5 5L8 2.5L13.5 5V11L8 13.5L2.5 11V5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M8 2.5V13.5" stroke="currentColor" strokeWidth="1.25" />
    </MetricIconBase>
  );
}

export function MetricAttentionIcon({ className }: IconProps) {
  return (
    <MetricIconBase className={className}>
      <path
        d="M8 2V9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12" r="0.75" fill="currentColor" />
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
    </MetricIconBase>
  );
}
