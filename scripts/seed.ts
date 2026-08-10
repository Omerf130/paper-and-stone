import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { connectDB, disconnectDB } from "../src/lib/db/mongoose";
import Category from "../src/models/Category";
import Product from "../src/models/Product";

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

  await Product.findOneAndUpdate(
    { slug: "milano-sofa" },
    {
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
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log("Seed complete: category=sofas, product=milano-sofa");

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
