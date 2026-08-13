export type AdminNavItem = {
  label: string;
  href: string;
  badgeCount?: number;
};

export type AdminNavGroup = {
  id: string;
  label?: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "main",
    items: [{ label: "ראשי", href: "/admin" }],
  },
  {
    id: "catalog",
    label: "קטלוג",
    items: [
      { label: "מוצרים", href: "/admin/products" },
      { label: "קטגוריות", href: "/admin/categories" },
      { label: "חומרים", href: "/admin/materials" },
      { label: "צבעים", href: "/admin/colors" },
    ],
  },
  {
    id: "workspace",
    label: "עבודה",
    items: [{ label: "פרויקטים", href: "/admin/projects" }],
  },
  {
    id: "system",
    label: "מערכת",
    items: [{ label: "משתמשים", href: "/admin/users" }],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap(
  (group) => group.items,
);

export function applyAdminNavBadges(
  groups: AdminNavGroup[],
  submittedProjectCount: number,
): AdminNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === "/admin/projects"
        ? { ...item, badgeCount: submittedProjectCount }
        : item,
    ),
  }));
}
