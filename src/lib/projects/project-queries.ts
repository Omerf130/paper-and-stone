import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { mapProductToView } from "@/lib/products/mapProductToView";
import Project from "@/models/Project";
import Product from "@/models/Product";
import Category from "@/models/Category";
import type { IProject } from "@/models/Project";
import {
  mapProjectToDetailView,
  mapProjectToListItemView,
  mapProjectToOptionView,
} from "@/lib/projects/mapProjectToView";
import type {
  ProjectDetailView,
  ProjectListItemView,
  ProjectOptionView,
} from "@/types/project";
import type { ProductView } from "@/types/product";
import { getUnreadMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";

export async function getProfessionalProjects(
  ownerUserId: string,
): Promise<ProjectListItemView[]> {
  await connectDB();

  const projects = await Project.find({ ownerUserId: new Types.ObjectId(ownerUserId) })
    .sort({ updatedAt: -1 })
    .lean();

  const projectIds = projects.map((project) => project._id.toString());
  const unreadCounts = await getUnreadMessageCountsForProjects(
    projectIds,
    ownerUserId,
    "professional",
  );

  return projects.map((project) => ({
    ...mapProjectToListItemView(project as IProject),
    unreadMessageCount: unreadCounts.get(project._id.toString()) ?? 0,
  }));
}

export async function getProfessionalProjectOptions(
  ownerUserId: string,
): Promise<ProjectOptionView[]> {
  await connectDB();

  const projects = await Project.find({
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: { $in: ["draft", "changes_requested"] },
  })
    .select("_id name")
    .sort({ updatedAt: -1 })
    .lean();

  return projects.map((project) =>
    mapProjectToOptionView(project as IProject),
  );
}

export async function getOwnedProjectById(
  ownerUserId: string,
  projectId: string,
): Promise<IProject | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });
}

export async function getOwnedProjectDetailView(
  ownerUserId: string,
  projectId: string,
): Promise<ProjectDetailView | null> {
  const project = await getOwnedProjectById(ownerUserId, projectId);

  if (!project) {
    return null;
  }

  return mapProjectToDetailView(project);
}

export async function loadProductViewsByIds(
  productIds: string[],
): Promise<Record<string, ProductView>> {
  if (productIds.length === 0) {
    return {};
  }

  await connectDB();

  const products = await Product.find({ _id: { $in: productIds } })
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .lean();

  const entries = await Promise.all(
    products.map(async (product) => [
      product._id.toString(),
      await mapProductToView(product as never),
    ] as const),
  );

  return Object.fromEntries(entries);
}
