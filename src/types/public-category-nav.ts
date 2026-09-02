import type { PublicCmsImageView } from "@/types/public-homepage-content";

export type PublicCategoryNavLeafView = {
  slug: string;
  nameHe: string;
  nameEn?: string;
  productCount: number;
  isNavigable: boolean;
  href?: string;
  image?: PublicCmsImageView;
};

export type PublicCategoryNavGroupView = {
  slug: string;
  nameHe: string;
  nameEn?: string;
  isNavigable: boolean;
  leaves: PublicCategoryNavLeafView[];
};

export type PublicCategoryNavDepartmentView = {
  slug: string;
  nameHe: string;
  nameEn?: string;
  isNavigable: boolean;
  href?: string;
  descriptionHe?: string;
  descriptionEn?: string;
  image?: PublicCmsImageView;
  groups: PublicCategoryNavGroupView[];
  directLeaves: PublicCategoryNavLeafView[];
};

export type PublicCategoryNavTreeView = {
  departments: PublicCategoryNavDepartmentView[];
};

/** @deprecated Use PublicCategoryNavDepartmentView via getPublicCategoryNavTree */
export type PublicCategoryNavItemView = {
  slug: string;
  nameHe: string;
  href: string;
  image?: PublicCmsImageView;
};

export type ProductFormCategoryParentOption = {
  id: string;
  nameHe: string;
  nameEn?: string;
  kind: "department" | "group";
  departmentNameHe: string;
};

export type ProductFormCategoryLeafOption = {
  id: string;
  slug: string;
  nameHe: string;
  nameEn?: string;
  isActive?: boolean;
  parentId: string;
  breadcrumb: string;
};

export type ProductFormCategoryTreeView = {
  parentOptions: ProductFormCategoryParentOption[];
  leaves: ProductFormCategoryLeafOption[];
};
