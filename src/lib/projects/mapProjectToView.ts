import type { IProject, IProjectItem } from "@/models/Project";
import type {
  ProjectDetailView,
  ProjectItemView,
  ProjectListItemView,
  ProjectOptionView,
} from "@/types/project";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db/mongoose";
import { mapReviewHistoryEntryToView } from "@/lib/projects/project-review-history";

export function mapProjectItemToView(
  item: IProjectItem,
  activeProductIds: Set<string>,
): ProjectItemView {
  return {
    id: item._id.toString(),
    productId: item.productId.toString(),
    selectedMaterialId: item.selectedMaterialId ?? null,
    selectedColorId: item.selectedColorId ?? null,
    selectedSizeKey: item.selectedSizeKey ?? null,
    quantity: item.quantity,
    snapshot: {
      productName: item.snapshot.productName,
      productSlug: item.snapshot.productSlug,
      sku: item.snapshot.sku,
      materialName: item.snapshot.materialName,
      colorName: item.snapshot.colorName,
      colorHex: item.snapshot.colorHex,
      sizeLabel: item.snapshot.sizeLabel,
    },
    isProductActive: activeProductIds.has(item.productId.toString()),
  };
}

export async function resolveActiveProductIds(
  productIds: string[],
): Promise<Set<string>> {
  if (productIds.length === 0) {
    return new Set();
  }

  await connectDB();

  const activeProducts = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  })
    .select("_id")
    .lean();

  return new Set(activeProducts.map((product) => product._id.toString()));
}

export function mapProjectToListItemView(project: IProject): ProjectListItemView {
  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    itemCount: project.items.length,
    submittedAt: project.submittedAt?.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function mapProjectToDetailView(
  project: IProject,
): Promise<ProjectDetailView> {
  const productIds = [...new Set(project.items.map((item) => item.productId.toString()))];
  const activeProductIds = await resolveActiveProductIds(productIds);

  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    location: project.location,
    description: project.description,
    status: project.status,
    items: project.items.map((item) =>
      mapProjectItemToView(item, activeProductIds),
    ),
    reviewHistory: (project.reviewHistory ?? []).map(mapReviewHistoryEntryToView),
    submittedAt: project.submittedAt?.toISOString(),
    reviewedAt: project.reviewedAt?.toISOString(),
    reviewedByUserId: project.reviewedByUserId?.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function mapProjectToOptionView(project: IProject): ProjectOptionView {
  return {
    id: project._id.toString(),
    name: project.name,
  };
}
