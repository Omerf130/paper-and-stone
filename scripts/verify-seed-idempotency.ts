import { connectDB, disconnectDB } from "../src/lib/db/mongoose";
import Color from "../src/models/Color";
import Material from "../src/models/Material";
import Product from "../src/models/Product";
import { DEMO_SEED_COLORS } from "./demo-seed-library";

async function verifySeedIdempotency() {
  await connectDB();

  const colorCount = await Color.countDocuments({
    code: { $in: DEMO_SEED_COLORS.map((color) => color.code) },
  });
  const materialCount = await Material.countDocuments({
    code: { $in: ["DEMO-VELVET", "DEMO-LINEN"] },
  });

  const milano = await Product.findOne({ slug: "milano-sofa" })
    .select("materialOptions fabrics")
    .lean();

  console.log("Demo colors count:", colorCount);
  console.log("Demo materials count:", materialCount);
  console.log(
    "Milano materialOptions count:",
    milano?.materialOptions?.length ?? 0,
  );
  console.log("Milano legacy fabrics preserved:", milano?.fabrics?.length ?? 0);

  if (colorCount !== DEMO_SEED_COLORS.length) {
    throw new Error(`Expected ${DEMO_SEED_COLORS.length} demo colors`);
  }
  if (materialCount !== 2) {
    throw new Error("Expected 2 demo materials");
  }
  if ((milano?.materialOptions?.length ?? 0) !== 2) {
    throw new Error("Expected 2 Milano materialOptions");
  }
  if ((milano?.fabrics?.length ?? 0) !== 2) {
    throw new Error("Expected legacy fabrics to remain on Milano");
  }

  await Color.updateOne(
    { code: "DEMO-BLUE" },
    { $set: { hex: "#ABCDEF", nameHe: "Admin Blue" } },
  );

  const { spawnSync } = await import("node:child_process");
  const seedResult = spawnSync("npm", ["run", "seed"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });

  if (seedResult.status !== 0) {
    throw new Error("Re-seed failed during admin overwrite verification");
  }

  const adminEditedColor = await Color.findOne({ code: "DEMO-BLUE" })
    .select("hex nameHe")
    .lean();

  if (adminEditedColor?.hex !== "#ABCDEF") {
    throw new Error("Seed overwrote admin-edited demo color HEX");
  }

  if (adminEditedColor?.nameHe !== "Admin Blue") {
    throw new Error("Seed overwrote admin-edited demo color name");
  }

  console.log("Admin-edited demo color preserved after re-seed");
  console.log("Seed idempotency verification passed");
}

verifySeedIdempotency()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await disconnectDB();
    process.exit(1);
  });
