import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { Types } from "mongoose";
import { connectDB, disconnectDB } from "../src/lib/db/mongoose";
import Category from "../src/models/Category";
import Color from "../src/models/Color";
import Material from "../src/models/Material";
import Product from "../src/models/Product";
import {
  DEMO_SEED_COLORS,
  DEMO_SEED_MATERIALS,
} from "./demo-seed-library";

function readEnvFile(envPath: string): string {
  const buffer = readFileSync(envPath);

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString("utf16le");
  }

  const content = buffer.toString("utf-8");
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readEnvFile(envPath);

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.replace(/^export\s+/, "");
    const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    const rawValue = match[2].trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key) {
      process.env[key] = value;
    }
  }
}

async function seedDemoColors(): Promise<Map<string, Types.ObjectId>> {
  const colorIdsByCode = new Map<string, Types.ObjectId>();

  for (const demoColor of DEMO_SEED_COLORS) {
    const color = await Color.findOneAndUpdate(
      { code: demoColor.code },
      {
        $setOnInsert: {
          nameHe: demoColor.nameHe,
          hex: demoColor.hex,
          isActive: true,
          sortOrder: demoColor.sortOrder,
          code: demoColor.code,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (color) {
      colorIdsByCode.set(demoColor.code, color._id);
    }
  }

  return colorIdsByCode;
}

async function seedDemoMaterials(
  colorIdsByCode: Map<string, Types.ObjectId>,
): Promise<Map<string, Types.ObjectId>> {
  const materialIdsByCode = new Map<string, Types.ObjectId>();

  for (const demoMaterial of DEMO_SEED_MATERIALS) {
    const colorIds = demoMaterial.colorCodes.map((code) => {
      const colorId = colorIdsByCode.get(code);
      if (!colorId) {
        throw new Error(`Missing demo color for code ${code}`);
      }
      return colorId;
    });

    const material = await Material.findOneAndUpdate(
      { code: demoMaterial.code },
      {
        $setOnInsert: {
          nameHe: demoMaterial.nameHe,
          nameEn: demoMaterial.nameEn,
          type: demoMaterial.type,
          colorIds,
          isActive: true,
          sortOrder: demoMaterial.sortOrder,
          code: demoMaterial.code,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (material) {
      materialIdsByCode.set(demoMaterial.code, material._id);
    }
  }

  return materialIdsByCode;
}

async function seed() {
  loadEnvLocal();
  await connectDB();

  const category = await Category.findOneAndUpdate(
    { slug: "sofas" },
    {
      nameHe: "ספות",
      slug: "sofas",
      isActive: true,
      sortOrder: 1,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const colorIdsByCode = await seedDemoColors();
  const materialIdsByCode = await seedDemoMaterials(colorIdsByCode);

  const velvetId = materialIdsByCode.get("DEMO-VELVET");
  const linenId = materialIdsByCode.get("DEMO-LINEN");

  if (!velvetId || !linenId) {
    throw new Error("Demo materials were not seeded");
  }

  const milanoMaterialOptions = [
    {
      materialId: velvetId,
      allowedColorIds: ["DEMO-BLUE", "DEMO-MUSTARD", "DEMO-GRAY"].map(
        (code) => colorIdsByCode.get(code)!,
      ),
    },
    {
      materialId: linenId,
      allowedColorIds: ["DEMO-NATURAL", "DEMO-STONE", "DEMO-SAGE"].map(
        (code) => colorIdsByCode.get(code)!,
      ),
    },
  ];

  await Product.findOneAndUpdate(
    { slug: "milano-sofa" },
    {
      $setOnInsert: {
        nameHe: "ספת Milano",
        nameEn: "Milano Sofa",
        slug: "milano-sofa",
        sku: "PS-MIL-001",
        categoryId: category._id,
        brand: "Paper & Stone Collection",
        designer: "Studio Forma",
        shortDescription:
          "ספה מודולרית בקווים נקיים, עם אפשרויות התאמה של בד, גוון ומידה.",
        longDescription:
          "ספת Milano מציעה קווים נקיים ונוחות יומיומית, עם אפשרות התאמה של בד, גוון ומידה. מתאימה לפרויקטים פרטיים ומסחריים — מסלון ועד חללים מלונאיים. זהו תוכן הדגמה זמני, לא העתק שיווקי סופי.",
        isActive: true,
        isFeatured: true,
        width: 260,
        depth: 98,
        height: 78,
        seatHeight: 43,
        materials: ["עץ מלא", "קצף בצפיפות גבוהה", "ריפוד לבחירה"],
        maintenance:
          "ניקוי עדין לפי סוג הבד. מומלץ להימנע מחשיפה ישירה וממושכת לשמש.",
        warranty: "אחריות יצרן — 5 שנים על שלדה, 2 שנים על ריפוד (תנאי הדגמה).",
        countryOfOrigin: "איטליה (ערך הדגמה)",
        fabrics: [
          {
            key: "velvet",
            label: "Velvet",
            colors: [
              { key: "blue", label: "כחול", visualTone: "blue" },
              { key: "mustard", label: "חרדל", visualTone: "mustard" },
              { key: "gray", label: "אפור", visualTone: "gray" },
            ],
          },
          {
            key: "linen",
            label: "Linen",
            colors: [
              { key: "natural", label: "טבעי", visualTone: "natural" },
              { key: "stone", label: "אבן", visualTone: "stone" },
              { key: "sage", label: "ירוק מרווה", visualTone: "sage" },
            ],
          },
        ],
        sizes: [
          { key: "220", label: '220 ס"מ' },
          { key: "260", label: '260 ס"מ' },
          { key: "300", label: '300 ס"מ' },
        ],
      },
      $set: {
        materialOptions: milanoMaterialOptions,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(
    "Seed complete: category=sofas, product=milano-sofa, demo library colors/materials/materialOptions",
  );

  const { seedAdmin } = await import("../src/lib/auth/seed-admin");
  await seedAdmin();
}

seed()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    await disconnectDB();
    process.exit(1);
  });
