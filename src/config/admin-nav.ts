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
    id: "content",
    label: "תוכן",
    items: [{ label: "תוכן", href: "/admin/content" }],
  },
  {
    id: "system",
    label: "מערכת",
    items: [
      { label: "בקשות אדריכל", href: "/admin/architect-requests" },
      { label: "משתמשים", href: "/admin/users" },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap(
  (group) => group.items,
);

type AdminNavBadgeCounts = {
  submittedProjectCount: number;
  pendingOnboardingProjectCount: number;
  pendingArchitectRequestCount: number;
};

export function applyAdminNavBadges(
  groups: AdminNavGroup[],
  counts: AdminNavBadgeCounts,
): AdminNavGroup[] {
  const projectsBadgeCount =
    counts.submittedProjectCount + counts.pendingOnboardingProjectCount;

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.href === "/admin/projects") {
        return { ...item, badgeCount: projectsBadgeCount };
      }

      if (item.href === "/admin/architect-requests") {
        return { ...item, badgeCount: counts.pendingArchitectRequestCount };
      }

      return item;
    }),
  }));
}
