import Image from "next/image";
import type { PublicCmsImageView } from "@/types/public-homepage-content";

type PublicCmsImageProps = {
  image: PublicCmsImageView;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function PublicCmsImage({
  image,
  className,
  sizes = "100vw",
  priority = false,
}: PublicCmsImageProps) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width ?? 1200}
      height={image.height ?? 800}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
