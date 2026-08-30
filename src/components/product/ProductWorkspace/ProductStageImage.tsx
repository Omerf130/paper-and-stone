"use client";

import { useEffect, useRef, useState } from "react";
import ProductImage from "@/components/product/ProductImage/ProductImage";
import {
  analyzeImageContentBounds,
  expandBoundsWithPadding,
  type ImageContentBounds,
} from "@/lib/media/image-content-bounds";
import type { PublicImageView } from "@/types/product-media";
import productImageStyles from "@/components/product/ProductImage/ProductImage.module.scss";

type ProductStageImageProps = {
  image: PublicImageView;
  priority?: boolean;
};

type BoundsFitState = {
  sourceUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  bounds: ImageContentBounds;
};

function buildAnalysisUrl(url: string): string {
  const params = new URLSearchParams({
    url,
    w: "1920",
    q: "75",
  });

  return `/_next/image?${params.toString()}`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.decoding = "async";
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Image load failed"));
    element.src = url;
  });
}

async function analyzeImageBoundsFit(
  url: string,
): Promise<Omit<BoundsFitState, "sourceUrl"> | null> {
  try {
    const element = await loadImage(buildAnalysisUrl(url));
    const naturalWidth = element.naturalWidth;
    const naturalHeight = element.naturalHeight;

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = naturalWidth;
    sampleCanvas.height = naturalHeight;

    const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
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

    return { naturalWidth, naturalHeight, bounds };
  } catch {
    return null;
  }
}

function getContentViewportSize(
  containerWidth: number,
  containerHeight: number,
  bounds: ImageContentBounds,
) {
  const aspect = bounds.contentWidth / bounds.contentHeight;

  const maxWidth = containerWidth * 0.9;
  const maxHeight = containerHeight * 0.9;

  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return {
    width,
    height,
  };
}

export default function ProductStageImage({
  image,
  priority = false,
}: ProductStageImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [boundsFit, setBoundsFit] = useState<BoundsFitState | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;
    setAnalysisFailed(false);
    setBoundsFit(null);

    void analyzeImageBoundsFit(image.url).then((result) => {
      if (cancelled) {
        return;
      }

      if (result) {
        setBoundsFit({ sourceUrl: image.url, ...result });
      } else {
        setAnalysisFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [image.url]);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const activeFit =
    boundsFit?.sourceUrl === image.url ? boundsFit : null;
  const ready =
    activeFit !== null &&
    containerSize.width > 0 &&
    containerSize.height > 0;

  if (analysisFailed) {
    return (
      <div ref={wrapRef} className={productImageStyles.imageWrapHero}>
        <ProductImage image={image} priority={priority} variant="hero" />
      </div>
    );
  }

  if (!ready || !activeFit) {
    return (
      <div
        ref={wrapRef}
        className={productImageStyles.imageWrapHero}
        aria-busy="true"
      />
    );
  }

  const { bounds, naturalWidth, naturalHeight } = activeFit;
  const viewport = getContentViewportSize(
    containerSize.width,
    containerSize.height,
    bounds,
  );
  const scale = viewport.width / bounds.contentWidth;
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = bounds.minX * scale;
  const offsetY = bounds.minY * scale;
  const displayUrl = buildAnalysisUrl(image.url);

  return (
    <div ref={wrapRef} className={productImageStyles.imageWrapHero}>
      <div
        style={{
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt={image.alt}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          style={{
            position: "absolute",
            display: "block",
            width: `${renderedWidth}px`,
            height: `${renderedHeight}px`,
            left: `${-offsetX}px`,
            top: `${-offsetY}px`,
            maxWidth: "none",
            maxHeight: "none",
          }}
        />
      </div>
    </div>
  );
}
