import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import type { Annonce } from "../../../../packages/mytypes/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = await getDb();
    const query = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { id: id as unknown as string };

    const doc = await db.collection("annonces").findOne(query);

    if (!doc) {
      return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 });
    }

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

    return NextResponse.json({ annonce });
  } catch (error) {
    console.error("Error fetching annonce by id:", error);
    return NextResponse.json({ error: "Failed to fetch annonce" }, { status: 500 });
  }
}
