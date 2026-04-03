export interface HandleGetImagesInput {
  annonceId: string;
}

export interface HandleGetImagesOutput {
  haveImage: boolean;
  firstImagePath: string | null;
  images: { imagePath: string }[];
}
