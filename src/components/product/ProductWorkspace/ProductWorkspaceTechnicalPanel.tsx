import TechnicalInfo from "@/components/product/TechnicalInfo/TechnicalInfo";
import type { ProductView } from "@/types/product";
import styles from "./ProductWorkspacePanels.module.scss";

type ProductWorkspaceTechnicalPanelProps = {
  product: ProductView;
};

export default function ProductWorkspaceTechnicalPanel({
  product,
}: ProductWorkspaceTechnicalPanelProps) {
  return (
    <div className={styles.infoWorkspace}>
      <TechnicalInfo
        product={product}
        variant="workspace"
        hideDimensions
      />
    </div>
  );
}
