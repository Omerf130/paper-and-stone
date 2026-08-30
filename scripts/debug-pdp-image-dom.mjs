import { chromium } from "playwright";

async function measure(page, label) {
  const data = await page.evaluate(() => {
    const stageInner = document.querySelector('[class*="stageInner"]');
    const wrap = document.querySelector('[class*="imageWrapHero"]');
    const clip = wrap?.querySelector('div[style*="overflow: hidden"]');
    const img = wrap?.querySelector("img");

    const box = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        clientW: el.clientWidth,
        clientH: el.clientHeight,
        rectW: Math.round(rect.width),
        rectH: Math.round(rect.height),
        width: cs.width,
        height: cs.height,
        maxWidth: cs.maxWidth,
        maxHeight: cs.maxHeight,
        objectFit: cs.objectFit,
        transform: cs.transform,
        position: cs.position,
      };
    };

    return {
      stageInner: box(stageInner),
      wrap: box(wrap),
      clip: box(clip),
      img: img
        ? {
            ...box(img),
            naturalW: img.naturalWidth,
            naturalH: img.naturalHeight,
            src: img.currentSrc.slice(0, 80),
          }
        : null,
      hasClip: Boolean(clip),
      wrapChildCount: wrap?.children.length ?? 0,
    };
  });

  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3000/products/milano-sofa", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(4000);
await measure(page, "initial");

const thumbButtons = page.locator('button[aria-pressed]');
const count = await thumbButtons.count();
for (let i = 0; i < count; i += 1) {
  await thumbButtons.nth(i).click();
  await page.waitForTimeout(2500);
  const label = await thumbButtons.nth(i).getAttribute("aria-label");
  await measure(page, label ?? `thumb-${i}`);
}

await browser.close();
