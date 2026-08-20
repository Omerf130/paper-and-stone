export type ClientApprovedProjectImageView = {
  url: string;
  alt: string;
};

export type ClientApprovedItemConfigurationView = {
  material?: string;
  color?: string;
  colorHex?: string;
  size?: string;
};

export type ClientApprovedProjectItemView = {
  projectItemId: string;
  productId?: string;
  productName: string;
  productSlug?: string;
  productCode: string;
  image?: ClientApprovedProjectImageView;
  configuration: ClientApprovedItemConfigurationView;
  quantity: number;
  clientUnitPriceAgorot: number;
  clientLineTotalAgorot: number;
};

export type ClientApprovedProjectRoomView = {
  roomId: string;
  name: string;
  order: number;
  items: ClientApprovedProjectItemView[];
  clientRoomTotalAgorot: number;
};

export type ClientApprovedArchitectView = {
  fullName: string;
};

export type ClientApprovedProjectView = {
  id: string;
  projectId: string;
  clientUserId: string;
  architectUserId: string;
  projectName: string;
  location?: string;
  description?: string;
  submissionRevision: number;
  approvedAt: string;
  architect: ClientApprovedArchitectView;
  rooms: ClientApprovedProjectRoomView[];
  clientProjectTotalAgorot: number;
  schemaVersion: number;
};

export type ClientApprovedProjectSnapshotPayload = {
  schemaVersion: number;
  projectId: string;
  clientUserId: string;
  architectUserId: string;
  projectName: string;
  location?: string;
  description?: string;
  submissionRevision: number;
  approvedAt: Date;
  architect: ClientApprovedArchitectView;
  rooms: Array<{
    roomId: string;
    name: string;
    order: number;
    items: Array<{
      projectItemId: string;
      productId?: string;
      productName: string;
      productSlug?: string;
      productCode: string;
      image?: ClientApprovedProjectImageView;
      configuration: ClientApprovedItemConfigurationView;
      quantity: number;
      clientUnitPriceAgorot: number;
      clientLineTotalAgorot: number;
    }>;
    clientRoomTotalAgorot: number;
  }>;
  clientProjectTotalAgorot: number;
};
