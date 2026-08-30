type IconProps = {
  className?: string;
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
