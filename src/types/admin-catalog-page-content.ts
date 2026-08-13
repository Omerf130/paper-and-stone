import type { CatalogPageContentView } from "@/types/cms-content";

export type PublicCatalogPageContentView = {
  eyebrow: string;
  heading: string;
  supportingText: string;
};

export function mapCatalogPageContentViewToFormInput(
  content: CatalogPageContentView,
): { eyebrow: string; heading: string; supportingText: string } {
  return {
    eyebrow: content.eyebrow,
    heading: content.heading,
    supportingText: content.supportingText,
  };
}

export type CatalogPageContentFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};
