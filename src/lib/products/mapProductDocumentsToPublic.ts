import type { IProductDocument } from "@/models/Product";
import type { PublicProductDocumentView } from "@/types/product-document";

type LeanProductDocument = Pick<
  IProductDocument,
  "_id" | "label" | "url" | "fileType" | "sortOrder"
>;

export function mapProductDocumentsToPublic(
  documents: LeanProductDocument[] | null | undefined,
): PublicProductDocumentView[] {
  if (!documents?.length) {
    return [];
  }

  return documents
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((document) => {
      const label = document.label?.trim() ?? "";
      const url = document.url?.trim() ?? "";

      if (!label || !url) {
        return null;
      }

      const view: PublicProductDocumentView = {
        id: document._id.toString(),
        label,
        url,
      };

      const fileType = document.fileType?.trim();
      if (fileType) {
        view.fileType = fileType;
      }

      return view;
    })
    .filter((document): document is PublicProductDocumentView => document !== null);
}
