import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";

export const MATERIAL_COLOR_ERRORS = {
  INVALID_COLOR_ID: "מזהה צבע לא תקין",
  COLOR_NOT_FOUND: "אחד או יותר מהצבעים שנבחרו לא קיימים",
  INACTIVE_COLOR: "לא ניתן להוסיף צבע לא פעיל",
} as const;

export type VerifyColorIdsResult =
  | { ok: true; colorIds: string[] }
  | { ok: false; message: string; field: string };

function dedupeColorIds(colorIds: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of colorIds) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  return result;
}

export async function verifyMaterialColorIds(
  colorIds: string[],
  previousColorIds: string[] = [],
): Promise<VerifyColorIdsResult> {
  const deduped = dedupeColorIds(colorIds);
  const previousSet = new Set(previousColorIds);

  for (const id of deduped) {
    if (!Types.ObjectId.isValid(id)) {
      return {
        ok: false,
        message: MATERIAL_COLOR_ERRORS.INVALID_COLOR_ID,
        field: "colorIds",
      };
    }
  }

  if (deduped.length === 0) {
    return { ok: true, colorIds: [] };
  }

  await connectDB();

  const colors = await Color.find({ _id: { $in: deduped } })
    .select("_id isActive")
    .lean();

  const colorById = new Map(
    colors.map((color) => [color._id.toString(), color]),
  );

  for (const id of deduped) {
    const color = colorById.get(id);
    if (!color) {
      return {
        ok: false,
        message: MATERIAL_COLOR_ERRORS.COLOR_NOT_FOUND,
        field: "colorIds",
      };
    }

    const isPreviouslyLinked = previousSet.has(id);
    if (!isPreviouslyLinked && !color.isActive) {
      return {
        ok: false,
        message: MATERIAL_COLOR_ERRORS.INACTIVE_COLOR,
        field: "colorIds",
      };
    }
  }

  return { ok: true, colorIds: deduped };
}
