import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import {
  getCatalogTaxonomyDefinition,
  type CatalogTaxonomyNodeDefinition,
} from "@/lib/categories/catalog-taxonomy";

export type EnsureCatalogTaxonomyResult = {
  created: number;
  updated: number;
  mappedExisting: number;
};

function buildCategoryPayload(
  node: CatalogTaxonomyNodeDefinition,
  parentId?: Types.ObjectId,
) {
  return {
    nameHe: node.nameHe,
    nameEn: node.nameEn,
    slug: node.slug,
    kind: node.kind,
    taxonomyKey: node.taxonomyKey,
    parentId,
    descriptionHe: node.descriptionHe,
    descriptionEn: node.descriptionEn,
    sortOrder: node.sortOrder,
    isActive: true,
  };
}

export async function ensureCatalogTaxonomy(): Promise<EnsureCatalogTaxonomyResult> {
  await connectDB();

  const definition = getCatalogTaxonomyDefinition();
  const slugToId = new Map<string, string>();
  let created = 0;
  let updated = 0;
  let mappedExisting = 0;

  for (const node of definition) {
    const parentObjectId = node.parentSlug
      ? slugToId.get(node.parentSlug)
      : undefined;

    if (node.parentSlug && !parentObjectId) {
      continue;
    }

    const payload = buildCategoryPayload(
      node,
      parentObjectId ? new Types.ObjectId(parentObjectId) : undefined,
    );

    if (node.existingSlug) {
      const existing = await Category.findOne({ slug: node.existingSlug }).lean();

      if (existing && !existing.taxonomyKey) {
        await Category.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...payload,
              slug: existing.slug,
            },
          },
        );
        slugToId.set(node.slug, existing._id.toString());
        mappedExisting += 1;
        updated += 1;
        continue;
      }
    }

    const existingByKey = await Category.findOne({
      taxonomyKey: node.taxonomyKey,
    })
      .select("_id createdAt updatedAt")
      .lean();

    const result = await Category.findOneAndUpdate(
      { taxonomyKey: node.taxonomyKey },
      { $set: payload },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (result) {
      slugToId.set(node.slug, result._id.toString());

      if (existingByKey) {
        updated += 1;
      } else {
        created += 1;
      }
    }
  }

  return { created, updated, mappedExisting };
}
