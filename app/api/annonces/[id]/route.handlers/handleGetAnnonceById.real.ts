import { getDb } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import type { Annonce } from "../../../../../packages/mytypes/types";
import type { HandleGetAnnonceByIdInput, HandleGetAnnonceByIdOutput } from "./handleGetAnnonceById.interface";

export class NotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NotFoundError";
  }
}

export async function handleGetAnnonceByIdReal(
  input: HandleGetAnnonceByIdInput
): Promise<HandleGetAnnonceByIdOutput> {
  const { id } = input;
  const db = await getDb();
  const query = ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : { id: id as unknown as string };

  const doc = await db.collection("annonces").findOne(query);

  if (!doc) throw new NotFoundError("Annonce non trouvée");

  const annonce: Annonce = {
    id: String(doc._id ?? doc.id),
    typeAnnonceId: doc.typeAnnonceId ?? "",
    typeAnnonceName: doc.typeAnnonceName ?? "",
    typeAnnonceNameAr: doc.typeAnnonceNameAr ?? "",
    categorieId: doc.categorieId ?? "",
    categorieName: doc.categorieName ?? "",
    categorieNameAr: doc.categorieNameAr ?? "",
    classificationFr: doc.classificationFr ?? "",
    classificationAr: doc.classificationAr ?? "",
    lieuId: doc.lieuId ?? "",
    lieuStr: doc.lieuStr ?? "",
    lieuStrAr: doc.lieuStrAr ?? "",
    moughataaId: doc.moughataaId ?? "",
    moughataaStr: doc.moughataaStr ?? "",
    moughataaStrAr: doc.moughataaStrAr ?? "",
    userId: doc.userId ?? "",
    title: doc.title ?? "",
    description: doc.description ?? "",
    price: doc.price != null ? Number(doc.price) : undefined,
    isPriceHidden: Boolean(doc.isPriceHidden ?? false),
    contact: doc.contact ?? "",
    haveImage: !!doc.haveImage,
    firstImagePath: doc.firstImagePath ? String(doc.firstImagePath) : "",
    images: [],
    status: doc.status ?? "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };

  return { annonce };
}
