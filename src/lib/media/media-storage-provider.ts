export type MediaUploadInput = {
  key: string;
  data: Buffer;
  contentType: string;
};

export type MediaUploadResult = {
  storageKey: string;
  url: string;
};

export interface MediaStorageProvider {
  upload(input: MediaUploadInput): Promise<MediaUploadResult>;
  delete(storageKey: string): Promise<void>;
}
