import { HandlePostMyAnnonceInput, HandlePostMyAnnonceOutput } from "./handlePostMyAnnonce.interface";

export async function handlePostMyAnnonceMocked(
  _input: HandlePostMyAnnonceInput
): Promise<HandlePostMyAnnonceOutput> {
  return {
    data: {
      id: "mock-id-123",
      typeAnnonceId: "1",
      title: "Mock annonce",
      description: "Description mock",
      status: "active",
      isPublished: false,
      haveImage: false,
      firstImagePath: null,
    },
    status: 201,
  };
}
