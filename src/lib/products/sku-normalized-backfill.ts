import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import {
  detectSkuNormalizedCollisions,
  normalizeProductSku,
  type SkuNormalizedCollision,
} from "@/lib/products/normalize-product-sku";

export type SkuNormalizedBackfillResult =
  | { status: "ready"; backfilledCount: number }
  | { status: "collisions"; collisions: SkuNormalizedCollision[] };

export async function inspectSkuNormalizedCollisions(): Promise<SkuNormalizedCollision[]> {
  await connectDB();

  const products = await Product.find({}).select("_id sku").lean();

  return detectSkuNormalizedCollisions(
    products.map((product) => ({
      id: product._id.toString(),
      sku: product.sku,
    })),
  );
}

export async function backfillSkuNormalized(): Promise<SkuNormalizedBackfillResult> {
  await connectDB();

  const products = await Product.find({}).select("_id sku skuNormalized").lean();
  const collisions = detectSkuNormalizedCollisions(
    products.map((product) => ({
      id: product._id.toString(),
      sku: product.sku,
    })),
  );

  if (collisions.length > 0) {
    return { status: "collisions", collisions };
  }

  let backfilledCount = 0;

  for (const product of products) {
    const normalized = normalizeProductSku(product.sku);

    if (product.skuNormalized === normalized) {
      continue;
    }

    await Product.updateOne(
      { _id: product._id },
      { $set: { skuNormalized: normalized } },
    );
    backfilledCount += 1;
  }

  return { status: "ready", backfilledCount };
}

export async function ensureSkuNormalizedUniqueIndex(): Promise<void> {
  await connectDB();

  const indexes = await Product.collection.indexes();
  const hasEquivalentIndex = indexes.some(
    (index) =>
      index.key?.skuNormalized === 1 && index.unique === true && index.sparse === true,
  );

  if (hasEquivalentIndex) {
    return;
  }

  await Product.collection.createIndex(
    { skuNormalized: 1 },
    { unique: true, sparse: true, name: "skuNormalized_unique" },
  );
}
