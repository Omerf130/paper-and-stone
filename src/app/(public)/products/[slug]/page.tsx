import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Section from "@/components/Section/Section";
import ProductConfigurator from "@/components/product/ProductConfigurator/ProductConfigurator";
import ProductDescription from "@/components/product/ProductDescription/ProductDescription";
import ProductInfo from "@/components/product/ProductInfo/ProductInfo";
import TechnicalInfo from "@/components/product/TechnicalInfo/TechnicalInfo";
import { getProductBySlug } from "@/lib/products/getProductBySlug";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

type ProductPageProps = PageProps<"/products/[slug]">;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Paper & Stone",
    };
  }

  return {
    title: `${product.nameHe} | Paper & Stone`,
    description: product.shortDescription || undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Section>
        <div className={styles.top}>
          <ProductConfigurator
            product={product}
            visualClassName={styles.visual}
            controlsClassName={styles.controls}
          />
          <div className={styles.info}>
            <ProductInfo product={product} />
          </div>
        </div>
      </Section>
      <TechnicalInfo product={product} />
      <ProductDescription product={product} />
    </>
  );
}
