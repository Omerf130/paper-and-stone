"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyLuminancePreservingRecolor,
  imageDimensionsMatch,
} from "@/lib/recolor/applyLuminancePreservingRecolor";
import type { PublicImageView, PublicRecolorMaskView } from "@/types/product-media";
import styles from "./ProductRecolorCanvas.module.scss";

type ProductRecolorCanvasProps = {
  sourceImage: PublicImageView;
  mask: PublicRecolorMaskView;
  hex: string;
  className?: string;
  fallback: ReactNode;
};

type LoadedAssets = {
  sourceData: ImageData;
  maskData: ImageData;
  width: number;
  height: number;
};

function loadCrossOriginImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = url;
  });
}

async function loadAssets(
  sourceImage: PublicImageView,
  mask: PublicRecolorMaskView,
): Promise<LoadedAssets> {
  const [source, maskImage] = await Promise.all([
    loadCrossOriginImage(sourceImage.url),
    loadCrossOriginImage(mask.url),
  ]);

  if (
    !imageDimensionsMatch(
      source.naturalWidth,
      source.naturalHeight,
      maskImage.naturalWidth,
      maskImage.naturalHeight,
    )
  ) {
    throw new Error("Dimension mismatch");
  }

  const width = source.naturalWidth;
  const height = source.naturalHeight;

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) {
    throw new Error("Canvas unsupported");
  }

  sourceContext.drawImage(source, 0, 0);
  const sourceData = sourceContext.getImageData(0, 0, width, height);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskContext) {
    throw new Error("Canvas unsupported");
  }

  maskContext.drawImage(maskImage, 0, 0);
  const maskData = maskContext.getImageData(0, 0, width, height);

  return {
    sourceData,
    maskData,
    width,
    height,
  };
}

export default function ProductRecolorCanvas({
  sourceImage,
  mask,
  hex,
  className,
  fallback,
}: ProductRecolorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetsRef = useRef<LoadedAssets | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const assetKey = `${sourceImage.url}|${mask.url}`;

  const renderRecolor = useCallback((assets: LoadedAssets, colorHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const recolored = applyLuminancePreservingRecolor(
      assets.sourceData,
      assets.maskData,
      colorHex,
    );

    canvas.width = recolored.width;
    canvas.height = recolored.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas unsupported");
    }

    context.clearRect(0, 0, recolored.width, recolored.height);
    context.putImageData(recolored, 0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    assetsRef.current = null;

    void loadAssets(sourceImage, mask)
      .then((assets) => {
        if (cancelled) {
          return;
        }

        assetsRef.current = assets;
        renderRecolor(assets, hex);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("failed");
        }
      });

    return () => {
      cancelled = true;
      assetsRef.current = null;
    };
  }, [assetKey, hex, mask, renderRecolor, sourceImage]);

  useEffect(() => {
    const assets = assetsRef.current;
    if (!assets || status !== "ready") {
      return;
    }

    try {
      renderRecolor(assets, hex);
    } catch {
      void Promise.resolve().then(() => setStatus("failed"));
    }
  }, [hex, renderRecolor, status]);

  if (status === "failed") {
    return <>{fallback}</>;
  }

  const classes = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  return (
    <div className={classes}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={sourceImage.alt}
        aria-busy={status === "loading"}
      />
      {status === "loading" ? (
        <span className={styles.loading} aria-live="polite">
          טוען תצוגה…
        </span>
      ) : null}
    </div>
  );
}
