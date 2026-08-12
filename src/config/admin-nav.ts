export type AdminNavItem = {
  label: string;
  href: string;
  badgeCount?: number;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "ראשי", href: "/admin" },
  { label: "מוצרים", href: "/admin/products" },
  { label: "קטגוריות", href: "/admin/categories" },
  { label: "צבעים", href: "/admin/colors" },
  { label: "חומרים", href: "/admin/materials" },
  { label: "משתמשים", href: "/admin/users" },
  { label: "פרויקטים", href: "/admin/projects" },
];
