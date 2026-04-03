import {
  HandlePutMyAnnonceInput,
  HandlePutMyAnnonceOutput,
} from "./handleMyAnnonce.interface";

export async function handlePutMyAnnonceMocked(
  input: HandlePutMyAnnonceInput
): Promise<HandlePutMyAnnonceOutput> {
  return {
    id: input.id,
    ...input.body,
    userId: "mock-user-id",
    status: "active",
    isPublished: false,
    haveImage: false,
    firstImagePath: null,
    updatedAt: new Date().toISOString(),
  };
}
