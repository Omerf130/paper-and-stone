import type { ComponentType, ReactNode } from "react";
import { adminNavItems } from "@/config/admin-nav";

type IconProps = {
  className?: string;
};

function NavIconBase({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HomeNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M3.5 8.5L10 3.5L16.5 8.5V16.5H12.5V11.5H7.5V16.5H3.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </NavIconBase>
  );
}

export function ProductsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M4 6.5H16V15.5H4V6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function SuppliersNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M3.5 14.5H16.5M5.5 14.5V8.5H8.5V14.5M11.5 14.5V6.5H14.5V14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </NavIconBase>
  );
}

export function MaterialsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 13.5L13.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function ProjectsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M4.5 5.5H15.5V15.5H4.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 5.5V4.5C7.5 4.22 7.72 4 8 4H12C12.28 4 12.5 4.22 12.5 4.5V5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function ContentNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M5.5 4.5H14.5V15.5H5.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 8H12M8 11H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function ClientRequestsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <circle cx="10" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 15.5C5.5 12.98 7.48 11 10 11C12.52 11 14.5 12.98 14.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function ArchitectRequestsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M4.5 15.5L10 4.5L15.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 12.5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function UsersNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.5" cy="9" r="1.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 15.5C3.5 13.57 5.07 12 7 12C8.93 12 10.5 13.57 10.5 15.5M10.5 15.5H16.5C16.5 13.85 15.15 12.5 13.5 12.5C12.45 12.5 11.52 13.08 11.05 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </NavIconBase>
  );
}

export function ClientsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <circle cx="10" cy="7.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 15.5C5 12.86 7.24 10.75 10 10.75C12.76 10.75 15 12.86 15 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function ArchitectsNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M4.5 15.5L10 5.5L15.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.25 12H12.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </NavIconBase>
  );
}

export function WorkflowNavIcon(props: IconProps) {
  return (
    <NavIconBase {...props}>
      <path
        d="M5 6.5H15M5 10H15M5 13.5H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="13.5" r="1.5" fill="currentColor" />
    </NavIconBase>
  );
}

const ADMIN_NAV_ICON_BY_HREF: Record<string, ComponentType<IconProps>> = {
  "/admin": HomeNavIcon,
  "/admin/products": ProductsNavIcon,
  "/admin/suppliers": SuppliersNavIcon,
  "/admin/materials": MaterialsNavIcon,
  "/admin/projects": ProjectsNavIcon,
  "/admin/clients": ClientsNavIcon,
  "/admin/architects": ArchitectsNavIcon,
  "/admin/content": ContentNavIcon,
  "/admin/users": UsersNavIcon,
  "/admin/settings/project-item-workflow": WorkflowNavIcon,
};

export function getAdminNavIcon(
  href: string,
): ComponentType<IconProps> | undefined {
  return ADMIN_NAV_ICON_BY_HREF[href];
}

export function getAdminNavIconHrefs(): string[] {
  return Object.keys(ADMIN_NAV_ICON_BY_HREF);
}

export function allAdminNavItemsHaveIcons(): boolean {
  return adminNavItems.every((item) => Boolean(getAdminNavIcon(item.href)));
}
