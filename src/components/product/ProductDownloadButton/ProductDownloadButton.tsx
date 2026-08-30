"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon } from "@/components/ui/icons/ProductActionIcons";
import { getPublicProductDownloads } from "@/lib/products/get-public-product-downloads";
import type { ProductView } from "@/types/product";
import styles from "./ProductDownloadButton.module.scss";

type ProductDownloadButtonProps = {
  product: Pick<ProductView, "documents">;
};

export default function ProductDownloadButton({
  product,
}: ProductDownloadButtonProps) {
  const downloads = getPublicProductDownloads(product);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  if (downloads.length === 0) {
    return null;
  }

  if (downloads.length === 1) {
    const download = downloads[0];

    return (
      <a
        href={download.url}
        className={styles.button}
        aria-label={`הורדת ${download.label}`}
        title={`הורדת ${download.label}`}
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <DownloadIcon className={styles.icon} />
      </a>
    );
  }

  return (
    <div ref={rootRef} className={styles.menuRoot}>
      <button
        type="button"
        className={styles.button}
        aria-label="הורדות"
        title="הורדות"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <DownloadIcon className={styles.icon} />
      </button>
      {isOpen ? (
        <div className={styles.menu} role="menu" aria-label="הורדות">
          <p className={styles.menuTitle}>הורדות</p>
          <ul className={styles.menuList}>
            {downloads.map((download) => (
              <li key={download.id}>
                <a
                  href={download.url}
                  className={styles.menuLink}
                  role="menuitem"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setIsOpen(false)}
                >
                  {download.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
