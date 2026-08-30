import {
  backfillProductMediaNormalization,
  type BackfillMediaTarget,
} from "@/lib/media/normalize-product-media-backfill";

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const apply = argv.includes("--apply");

  if (dryRun === apply) {
    throw new Error("Specify exactly one of --dry-run or --apply.");
  }

  const productSlugIndex = argv.findIndex(
    (arg) => arg === "--product-slug" || arg === "--product",
  );
  const productSlug =
    productSlugIndex >= 0 ? argv[productSlugIndex + 1] : undefined;

  if (!productSlug) {
    throw new Error("Missing required --product-slug <slug>.");
  }

  const slots: BackfillMediaTarget[] = [];
  if (argv.includes("--gallery-only")) {
    slots.push("gallery");
  } else {
    if (argv.includes("--primary")) {
      slots.push("primary");
    }
    if (argv.includes("--gallery")) {
      slots.push("gallery");
    }
  }

  return {
    dryRun,
    productSlug,
    slots:
      slots.length > 0
        ? slots
        : (["primary", "gallery"] as BackfillMediaTarget[]),
  };
}

async function runNormalizeProductMediaScript(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const report = await backfillProductMediaNormalization(options);

  console.log(
    `Product media normalization ${report.dryRun ? "dry run" : "apply"}:`,
  );
  console.log(`  product: ${report.productSlug}`);
  console.log(`  items: ${report.items.length}`);

  for (const item of report.items) {
    console.log(
      [
        `- [${item.action}] ${item.slot}`,
        item.originalFilename,
        `reason=${item.reason}`,
        item.currentWidth && item.currentHeight
          ? `current=${item.currentWidth}x${item.currentHeight}`
          : null,
        item.nextWidth && item.nextHeight
          ? `next=${item.nextWidth}x${item.nextHeight}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
}

runNormalizeProductMediaScript()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Product media normalization failed:", error);
    process.exit(1);
  });
