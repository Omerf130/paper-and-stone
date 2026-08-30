import { connectDB } from "@/lib/db/mongoose";
import MaterialType from "@/models/MaterialType";
import type { MaterialTypeOption } from "@/types/admin-material";
import { seedBuiltinMaterialTypes } from "./material-type-mutations";

export async function getMaterialTypeOptions(): Promise<MaterialTypeOption[]> {
  await connectDB();
  await seedBuiltinMaterialTypes();

  const types = await MaterialType.find({ isActive: true })
    .sort({ sortOrder: 1, labelEn: 1 })
    .select("key labelEn")
    .lean();

  return types.map((type) => ({
    key: type.key,
    labelEn: type.labelEn,
  }));
}

export async function getMaterialTypeLabelMap(): Promise<Map<string, string>> {
  const options = await getMaterialTypeOptions();
  return new Map(options.map((option) => [option.key, option.labelEn]));
}
