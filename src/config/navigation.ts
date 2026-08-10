export type NavItem = {
  label: string;
  href?: string;
};

export const mainNavItems: NavItem[] = [
  { label: "מוצרים", href: "/products" },
  { label: "חומרים" },
  { label: "קולקציות" },
  { label: "פרויקטים והשראה" },
  { label: "לאדריכלים ומעצבים" },
  { label: "אודות" },
  { label: "צור קשר" },
];

export type FooterNavGroup = {
  title: string;
  items: NavItem[];
};

export const footerNavGroups: FooterNavGroup[] = [
  {
    title: "מוצרים",
    items: [
      { label: "מוצרים", href: "/products" },
      { label: "חומרים" },
      { label: "קולקציות" },
    ],
  },
  {
    title: "חברה",
    items: [
      { label: "אודות" },
      { label: "פרויקטים והשראה" },
      { label: "צור קשר" },
    ],
  },
  {
    title: "מקצוענים",
    items: [{ label: "לאדריכלים ומעצבים" }, { label: "אזור אישי" }],
  },
];
