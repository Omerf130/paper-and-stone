export function normalizeProductSku(sku: string): string {
  return sku.trim().toLowerCase();
}

export type SkuNormalizedCollision = {
  normalizedSku: string;
  products: Array<{ id: string; sku: string }>;
};

export function detectSkuNormalizedCollisions(
  products: Array<{ id: string; sku: string }>,
): SkuNormalizedCollision[] {
  const groups = new Map<string, Array<{ id: string; sku: string }>>();

  for (const product of products) {
    const normalized = normalizeProductSku(product.sku);
    const existing = groups.get(normalized) ?? [];
    existing.push(product);
    groups.set(normalized, existing);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([normalizedSku, groupProducts]) => ({
      normalizedSku,
      products: groupProducts,
    }));
}
