"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import type { PublicCategoryNavDepartmentView } from "@/types/public-category-nav";
import { ArrowRightIcon } from "./icons";
import styles from "./CategoryMegaMenu.module.scss";

type CategoryMegaMenuProps = {
  department: PublicCategoryNavDepartmentView | null;
  isOpen: boolean;
  onClose: () => void;
  onPanelMouseEnter?: () => void;
  panelId: string;
};

function renderLeafLabel(
  leaf: PublicCategoryNavDepartmentView["groups"][number]["leaves"][number],
  onClose: () => void,
) {
  if (leaf.isNavigable && leaf.href) {
    return (
      <Link href={leaf.href} className={styles.columnLink} onClick={onClose}>
        {leaf.nameHe}
      </Link>
    );
  }

  return (
    <span className={`${styles.columnLink} ${styles.columnLinkDisabled}`} aria-disabled="true">
      {leaf.nameHe}
    </span>
  );
}

export default function CategoryMegaMenu({
  department,
  isOpen,
  onClose,
  onPanelMouseEnter,
  panelId,
}: CategoryMegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !department) {
    return null;
  }

  const description = department.descriptionHe ?? department.descriptionEn;

  return (
    <div
      id={panelId}
      ref={panelRef}
      className={styles.panel}
      role="region"
      aria-label={`תפריט ${department.nameHe}`}
      onMouseEnter={onPanelMouseEnter}
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 className={styles.title}>{department.nameHe}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
          {department.isNavigable && department.href ? (
            <Link href={department.href} className={styles.viewAll} onClick={onClose}>
              <span>צפייה בכל {department.nameHe}</span>
              <ArrowRightIcon className={styles.viewAllIcon} />
            </Link>
          ) : (
            <span className={`${styles.viewAll} ${styles.viewAllDisabled}`} aria-disabled="true">
              <span>צפייה בכל {department.nameHe}</span>
              <ArrowRightIcon className={styles.viewAllIcon} />
            </span>
          )}
        </div>

        <div className={styles.links}>
          <div className={styles.columns}>
            {department.groups.map((group) => (
              <div key={group.slug} className={styles.groupColumn}>
                <p className={styles.groupHeading}>{group.nameHe}</p>
                <ul className={styles.columnList}>
                  {group.leaves.map((leaf) => (
                    <li key={leaf.slug}>{renderLeafLabel(leaf, onClose)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.imageWrap}>
          {department.image ? (
            <Image
              src={department.image.url}
              alt={department.image.alt}
              width={department.image.width ?? 640}
              height={department.image.height ?? 480}
              className={styles.image}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          ) : (
            <VisualPlaceholder aspectRatio="landscape" className={styles.imagePlaceholder} />
          )}
        </div>
      </div>
    </div>
  );
}
