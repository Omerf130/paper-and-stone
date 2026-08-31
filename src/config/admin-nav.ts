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
      { label: "ספקים", href: "/admin/suppliers" },
      { label: "חומרים", href: "/admin/materials" },
    ],
  },
  {
    id: "people",
    label: "אנשים",
    items: [
      { label: "לקוחות", href: "/admin/clients" },
      { label: "אדריכלים", href: "/admin/architects" },
    ],
  },
  {
    id: "workspace",
    label: "עבודה",
    items: [{ label: "פרויקטים", href: "/admin/projects" }],
  },
  {
    id: "content",
    label: "תוכן",
    items: [{ label: "תוכן", href: "/admin/content" }],
  },
  {
    id: "system",
    label: "מערכת",
    items: [
      { label: "משתמשים", href: "/admin/users" },
      {
        label: "תהליך סטטוס מוצר",
        href: "/admin/settings/project-item-workflow",
      },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap(
  (group) => group.items,
);

type AdminNavBadgeCounts = {
  attentionProjectCount: number;
  pendingArchitectRequestCount: number;
  pendingClientRequestCount: number;
};

export function applyAdminNavBadges(
  groups: AdminNavGroup[],
  counts: AdminNavBadgeCounts,
): AdminNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.href === "/admin/projects") {
        return { ...item, badgeCount: counts.attentionProjectCount };
      }

      return item;
    }),
  }));
}
