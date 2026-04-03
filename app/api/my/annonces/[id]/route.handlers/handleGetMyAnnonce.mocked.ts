import {
  HandleGetMyAnnonceInput,
  HandleGetMyAnnonceOutput,
} from "./handleMyAnnonce.interface";

export async function handleGetMyAnnonceMocked(
  input: HandleGetMyAnnonceInput
): Promise<HandleGetMyAnnonceOutput> {
  return {
    id: input.id,
    typeAnnonceId: "1",
    title: "Mock annonce",
    description: "Description mock",
    status: "active",
    isPublished: false,
    haveImage: false,
    firstImagePath: null,
    userId: "mock-user-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
