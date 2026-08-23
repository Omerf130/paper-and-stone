import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import ProductConfigurator from "@/components/product/ProductConfigurator/ProductConfigurator";
import ProductDescription from "@/components/product/ProductDescription/ProductDescription";
import ProductInfo from "@/components/product/ProductInfo/ProductInfo";
import TechnicalInfo from "@/components/product/TechnicalInfo/TechnicalInfo";
import { canAccessArchitectWorkspace } from "@/lib/auth/account-access";
import { isClientUser } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  buildLoginHref,
  buildRegisterHref,
} from "@/lib/auth/safe-next-url";
import {
  buildProductWithProjectContextHref,
  catalogParamsToHrefInput,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";
import { getArchitectEditableProjectOptions } from "@/lib/projects/project-queries";
import { getArchitectCatalogProjectContext } from "@/lib/projects/get-architect-catalog-project-context";
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

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const catalogParams = parseCatalogParams(resolvedSearchParams);
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const user = await getCurrentUser();
  const isApprovedArchitect = user !== null && canAccessArchitectWorkspace(user);
  const isClient = isClientUser(user);
  const productPath = buildProductWithProjectContextHref(
    slug,
    catalogParamsToHrefInput(catalogParams),
  );

  let projectOptions: { id: string; name: string }[] = [];
  let profileReady = false;
  let catalogContext = null;

  if (isApprovedArchitect && user) {
    projectOptions = await getArchitectEditableProjectOptions(user.id);
    const profile = await getMyProfessionalProfileView(user.id);
    profileReady = isProfileReadyForProjects(profile);

    if (catalogParams.projectId && catalogParams.roomId) {
      catalogContext = await getArchitectCatalogProjectContext(user.id, {
        projectId: catalogParams.projectId,
        roomId: catalogParams.roomId,
      });
    }
  }

  return (
    <>
      <Section contained={false} className={styles.heroSection}>
        <Container variant="wide">
          <ProductConfigurator
            product={product}
            identity={<ProductInfo product={product} />}
            catalogContext={catalogContext}
            isApprovedArchitect={isApprovedArchitect}
            isClient={isClient}
            projectOptions={projectOptions}
            profileReady={profileReady}
            loginHref={buildLoginHref(productPath)}
            registerHref={buildRegisterHref(productPath)}
          />
        </Container>
      </Section>
      <TechnicalInfo product={product} />
      <ProductDescription product={product} />
    </>
  );
}
