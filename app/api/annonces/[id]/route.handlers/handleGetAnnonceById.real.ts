import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { annonces } from "../../../../../lib/schema";
import type { Annonce } from "../../../../../packages/mytypes/types";
import type { HandleGetAnnonceByIdInput, HandleGetAnnonceByIdOutput } from "./handleGetAnnonceById.interface";

export class NotFoundError extends Error {
  constructor(msg: string) { super(msg); this.name = "NotFoundError"; }
}

export async function handleGetAnnonceByIdReal(
  input: HandleGetAnnonceByIdInput
): Promise<HandleGetAnnonceByIdOutput> {
  const id = parseInt(String(input.id), 10);
  if (isNaN(id)) throw new NotFoundError("Annonce non trouvée");

  const [doc] = await db.select().from(annonces).where(eq(annonces.id, id)).limit(1);
  if (!doc) throw new NotFoundError("Annonce non trouvée");

  const annonce: Annonce = {
    id: String(doc.id),
    typeAnnonceId: String(doc.typeAnnonceId),
    categorieId: String(doc.categorieId),
    subcategorieId: doc.subcategorieId ? String(doc.subcategorieId) : undefined,
    classificationFr: doc.classificationFr ?? "",
    classificationAr: doc.classificationAr ?? "",
    lieuId: doc.lieuId ? String(doc.lieuId) : "",
    lieuStr: doc.lieuStr ?? "",
    lieuStrAr: doc.lieuStrAr ?? "",
    moughataaId: doc.moughataaId ? String(doc.moughataaId) : "",
    moughataaStr: doc.moughataaStr ?? "",
    moughataaStrAr: doc.moughataaStrAr ?? "",
    userId: String(doc.userId),
    title: doc.title,
    description: doc.description,
    price: doc.price != null ? Number(doc.price) : undefined,
    isPriceHidden: doc.isPriceHidden,
    contact: doc.contact,
    haveImage: doc.haveImage,
    firstImagePath: doc.firstImagePath ?? "",
    images: [],
    status: doc.status,
    updatedAt: doc.updatedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };

  return { annonce };
}
