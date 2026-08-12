export type ProfessionalNavItem = {
  label: string;
  href: string;
  badgeCount?: number;
};

export const professionalNavItems: ProfessionalNavItem[] = [
  { label: "ראשי", href: "/professional" },
  { label: "הפרויקטים שלי", href: "/professional/projects" },
  { label: "התראות", href: "/professional/notifications" },
  { label: "הפרופיל שלי", href: "/professional/profile" },
];
