import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";
import sharp from "sharp";

config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false });
const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);

function analyzeContentBounds(data, width, height, channels) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = channels === 4 ? data[index + 3] : 255;
      const brightness = (red + green + blue) / 3;
      const isContent = alpha > 16 && brightness < 245;

      if (isContent) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

async function analyzeImage(label, url, originalFilename) {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { minX, minY, maxX, maxY } = analyzeContentBounds(
    data,
    info.width,
    info.height,
    info.channels,
  );
  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;

  console.log(
    JSON.stringify(
      {
        label,
        originalFilename,
        url,
        fileDimensions: { width: meta.width, height: meta.height },
        aspectRatio: Number((meta.width / meta.height).toFixed(4)),
        byteSize: buffer.length,
        contentBounds: { minX, minY, maxX, maxY, contentWidth, contentHeight },
        contentAsPercentOfFile: {
          width: Number(((contentWidth / meta.width) * 100).toFixed(1)),
          height: Number(((contentHeight / meta.height) * 100).toFixed(1)),
          area: Number(
            (
              ((contentWidth * contentHeight) / (meta.width * meta.height)) *
              100
            ).toFixed(1),
          ),
        },
        whitespaceMarginsPx: {
          top: minY,
          right: meta.width - 1 - maxX,
          bottom: meta.height - 1 - maxY,
          left: minX,
        },
        contentCenterPercent: {
          x: Number((((minX + maxX) / 2 / meta.width) * 100).toFixed(1)),
          y: Number((((minY + maxY) / 2 / meta.height) * 100).toFixed(1)),
        },
        bakedInWhitespace:
          contentWidth < meta.width * 0.98 || contentHeight < meta.height * 0.85,
      },
      null,
      2,
    ),
  );
}

await mongoose.connect(uri);
const product = await Product.findOne({ slug: "milano-sofa" })
  .select("media.primaryImage media.gallery")
  .lean();

const primary = product?.media?.primaryImage;
const gallery = product?.media?.gallery ?? [];

console.log("=== MILANO SOFA MEDIA RECORDS ===\n");

if (primary) {
  await analyzeImage(
    "primary (likely mustard — first/default image)",
    primary.url,
    primary.originalFilename,
  );
  console.log("");
}

for (const [index, item] of gallery.entries()) {
  await analyzeImage(
    `gallery[${index}] (likely green — second thumbnail)`,
    item.url,
    item.originalFilename,
  );
  console.log("");
}

await mongoose.disconnect();
