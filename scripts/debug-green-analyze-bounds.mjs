import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { chromium } from "playwright";

config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false });
const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);

await mongoose.connect(uri);
const product = await Product.findOne({ slug: "milano-sofa" })
  .select("media.gallery")
  .lean();

const green =
  product?.media?.gallery?.find((item) =>
    item.originalFilename?.includes("22.02.24"),
  ) ?? product?.media?.gallery?.[0];

if (!green?.url) {
  console.error("Green gallery image not found");
  process.exit(1);
}

const greenUrl = green.url;
console.log("Green source URL:", greenUrl);
console.log("Green filename:", green.originalFilename);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/products/milano-sofa", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});

const result = await page.evaluate(async (blobUrl) => {
  const BRIGHTNESS_THRESHOLD = 245;
  const ALPHA_THRESHOLD = 16;
  const DEFAULT_PADDING_RATIO = 0.03;

  function analyzeImageContentBounds(data, width, height, channels = 4) {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * channels;
        const red = data[index];
        const greenChannel = data[index + 1];
        const blue = data[index + 2];
        const alpha = channels === 4 ? data[index + 3] : 255;
        const brightness = (red + greenChannel + blue) / 3;
        const isContent =
          alpha > ALPHA_THRESHOLD && brightness < BRIGHTNESS_THRESHOLD;

        if (isContent) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return {
        minX: 0,
        minY: 0,
        maxX: width - 1,
        maxY: height - 1,
        contentWidth: width,
        contentHeight: height,
      };
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      contentWidth: maxX - minX + 1,
      contentHeight: maxY - minY + 1,
    };
  }

  function expandBoundsWithPadding(
    bounds,
    imageWidth,
    imageHeight,
    paddingRatio = DEFAULT_PADDING_RATIO,
  ) {
    const padding = Math.max(
      4,
      Math.round(Math.max(imageWidth, imageHeight) * paddingRatio),
    );
    const minX = Math.max(0, bounds.minX - padding);
    const minY = Math.max(0, bounds.minY - padding);
    const maxX = Math.min(imageWidth - 1, bounds.maxX + padding);
    const maxY = Math.min(imageHeight - 1, bounds.maxY + padding);

    return {
      minX,
      minY,
      maxX,
      maxY,
      contentWidth: maxX - minX + 1,
      contentHeight: maxY - minY + 1,
    };
  }

  function buildAnalysisUrl(url) {
    const params = new URLSearchParams({ url, w: "1920", q: "75" });
    return `/_next/image?${params.toString()}`;
  }

  const element = await new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = buildAnalysisUrl(blobUrl);
  });

  const naturalWidth = element.naturalWidth;
  const naturalHeight = element.naturalHeight;

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = naturalWidth;
  sampleCanvas.height = naturalHeight;

  const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { error: "Canvas unsupported" };
  }

  context.drawImage(element, 0, 0);
  const sampleData = context.getImageData(0, 0, naturalWidth, naturalHeight);
  const bounds = expandBoundsWithPadding(
    analyzeImageContentBounds(
      sampleData.data,
      naturalWidth,
      naturalHeight,
    ),
    naturalWidth,
    naturalHeight,
  );

  return {
    naturalWidth,
    naturalHeight,
    bounds,
    analysisUrl: buildAnalysisUrl(blobUrl),
  };
}, greenUrl);

await browser.close();
await mongoose.disconnect();

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const { naturalWidth, naturalHeight, bounds, analysisUrl } = result;

console.log("\n=== analyzeImageBoundsFit() RUNTIME RESULT (GREEN) ===\n");
console.log("analysisUrl:", analysisUrl);
console.log("naturalWidth:", naturalWidth);
console.log("naturalHeight:", naturalHeight);
console.log("bounds.minX:", bounds.minX);
console.log("bounds.minY:", bounds.minY);
console.log("bounds.maxX:", bounds.maxX);
console.log("bounds.maxY:", bounds.maxY);
console.log("bounds.contentWidth:", bounds.contentWidth);
console.log("bounds.contentHeight:", bounds.contentHeight);
console.log(
  "bounds.contentWidth / naturalWidth:",
  bounds.contentWidth / naturalWidth,
);
console.log(
  "bounds.contentHeight / naturalHeight:",
  bounds.contentHeight / naturalHeight,
);
