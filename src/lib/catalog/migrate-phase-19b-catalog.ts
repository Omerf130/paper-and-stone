import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import MaterialType from "@/models/MaterialType";
import { seedBuiltinMaterialTypes } from "@/lib/materials/material-type-mutations";
import {
  BUILTIN_MATERIAL_TYPE_LABELS,
} from "@/types/material";

export type Phase19bMigrationResult = {
  materialTypesSeeded: number;
  materialsMigrated: number;
  variantsCreated: number;
  otherTypesRemapped: number;
  materialsAlreadyHadVariants: number;
  productsWithoutSupplier: number;
};

async function ensureCustomMaterialTypeForOther(): Promise<string> {
  const existing = await MaterialType.findOne({ key: "CUSTOM" }).lean();
  if (existing) {
    return "CUSTOM";
  }

  await MaterialType.create({
    key: "CUSTOM",
    labelEn: "Custom",
    isBuiltIn: false,
    sortOrder: 999,
    isActive: true,
  });

  return "CUSTOM";
}

export async function migratePhase19bCatalog(): Promise<Phase19bMigrationResult> {
  await connectDB();
  await seedBuiltinMaterialTypes();

  const customTypeKey = await ensureCustomMaterialTypeForOther();

  const materials = await Material.find({}).lean();
  let materialsMigrated = 0;
  let variantsCreated = 0;
  let otherTypesRemapped = 0;
  let materialsAlreadyHadVariants = 0;

  for (const material of materials) {
    const updates: Record<string, unknown> = {};

    if (!material.nameEn && material.nameHe) {
      updates.nameEn = material.nameHe;
    }

    if (material.type === "OTHER") {
      updates.type = customTypeKey;
      otherTypesRemapped += 1;
    }

    if (material.variants?.length) {
      materialsAlreadyHadVariants += 1;
    } else if (material.colorIds?.length) {
      const colors = await Color.find({ _id: { $in: material.colorIds } }).lean();

      const variants = colors.map((color) => ({
        _id: color._id,
        name: color.nameEn?.trim() || color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      }));

      updates.variants = variants;
      updates.colorIds = variants.map((variant) => variant._id);
      materialsMigrated += 1;
      variantsCreated += variants.length;
    }

    if (Object.keys(updates).length > 0) {
      await Material.updateOne({ _id: material._id }, { $set: updates });
    }
  }

  const Product = (await import("@/models/Product")).default;
  const productsWithoutSupplier = await Product.countDocuments({
    $or: [{ supplierId: { $exists: false } }, { supplierId: null }],
  });

  const materialTypeCount = await MaterialType.countDocuments({
    key: { $in: Object.keys(BUILTIN_MATERIAL_TYPE_LABELS) },
  });

  return {
    materialTypesSeeded: materialTypeCount,
    materialsMigrated,
    variantsCreated,
    otherTypesRemapped,
    materialsAlreadyHadVariants,
    productsWithoutSupplier,
  };
}

export async function inspectUnmigratedMaterials(): Promise<
  Array<{ id: string; nameEn?: string; colorIds: number; variants: number }>
> {
  await connectDB();

  const materials = await Material.find({})
    .select("nameEn colorIds variants")
    .lean();

  return materials
    .filter(
      (material) =>
        !(material.variants?.length) && (material.colorIds?.length ?? 0) > 0,
    )
    .map((material) => ({
      id: material._id.toString(),
      nameEn: material.nameEn,
      colorIds: material.colorIds?.length ?? 0,
      variants: material.variants?.length ?? 0,
    }));
}
