export type CategoryItem = {
  id: string;
  name: string;
  layout: "large" | "medium";
};

export type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  layout: "featured" | "standard";
};

export type WorkflowStep = {
  step: string;
  title: string;
};

export const categories: CategoryItem[] = [
  { id: "sofas", name: "ספות", layout: "large" },
  { id: "armchairs", name: "כורסאות", layout: "medium" },
  { id: "chairs", name: "כיסאות", layout: "medium" },
  { id: "tables", name: "שולחנות", layout: "large" },
  { id: "lighting", name: "תאורה", layout: "medium" },
  { id: "materials", name: "חומרים וגמרים", layout: "medium" },
];

export const projects: ProjectItem[] = [
  {
    id: "residence-01",
    title: "Residence 01",
    subtitle: "Tel Aviv",
    layout: "featured",
  },
  {
    id: "private-house",
    title: "Private House",
    subtitle: "Herzliya",
    layout: "standard",
  },
  {
    id: "interior-study",
    title: "Interior Study",
    subtitle: "Ramat Hasharon",
    layout: "standard",
  },
];

export const workflowSteps: WorkflowStep[] = [
  { step: "01", title: "פותחים פרויקט" },
  { step: "02", title: "יוצרים חדרים" },
  { step: "03", title: "בוחרים מוצרים וחומרים" },
  { step: "04", title: "שולחים לתמחור" },
];
