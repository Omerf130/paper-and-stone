export type ArchitectCatalogProjectContextView = {
  projectId: string;
  projectName: string;
  roomId: string;
  roomName: string;
  returnHref: string;
};

export type CatalogProjectContextParams = {
  projectId: string | null;
  roomId: string | null;
};
