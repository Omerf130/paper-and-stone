export type AdminNavItem = {
  label: string;
  href: string;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "ראשי", href: "/admin" },
  { label: "מוצרים", href: "/admin/products" },
  { label: "קטגוריות", href: "/admin/categories" },
];
