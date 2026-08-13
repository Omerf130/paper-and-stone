import { connectDB } from "@/lib/db/mongoose";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import CatalogPageContent from "@/models/CatalogPageContent";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

export type CatalogPageContentWriteFields = {
  eyebrow: string;
  heading: string;
  supportingText: string;
};

export class CatalogPageContentMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogPageContentMutationError";
  }
}

export async function upsertCatalogPageContent(
  fields: CatalogPageContentWriteFields,
): Promise<void> {
  await connectDB();

  await CatalogPageContent.findOneAndUpdate(
    { key: CMS_SINGLETON_KEYS.catalog },
    {
      $set: {
        key: CMS_SINGLETON_KEYS.catalog,
        schemaVersion: CMS_SCHEMA_VERSION,
        eyebrow: fields.eyebrow,
        heading: fields.heading,
        supportingText: fields.supportingText,
      },
    },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

export async function catalogDocumentExists(): Promise<boolean> {
  await connectDB();
  const exists = await CatalogPageContent.exists({ key: CMS_SINGLETON_KEYS.catalog });
  return Boolean(exists);
}
