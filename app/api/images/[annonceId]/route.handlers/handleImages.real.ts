import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getDb } from "../../../../../lib/mongodb";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import type { HandleGetImagesInput, HandleGetImagesOutput } from "./handleGetImages.interface";
import type { HandlePostImagesInput, HandlePostImagesOutput } from "./handlePostImages.interface";
import type { HandleDeleteImageInput, HandleDeleteImageOutput } from "./handleDeleteImage.interface";

const MAX_FILES = 8;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function safeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Non authentifié") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Accès interdit") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = "Introuvable") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  status = 400;
  constructor(message = "Requête invalide") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class UnsupportedMediaError extends Error {
  status = 415;
  constructor(message = "Type non autorisé") {
    super(message);
    this.name = "UnsupportedMediaError";
  }
}

export class PayloadTooLargeError extends Error {
  status = 413;
  constructor(message = "Fichier trop volumineux (>10MB)") {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

// ---------- GET ----------
export async function handleGetImagesReal(
  input: HandleGetImagesInput
): Promise<HandleGetImagesOutput> {
  const { annonceId } = input;
  if (!ObjectId.isValid(annonceId)) throw new BadRequestError("annonceId invalide");

  const db = await getDb();
  const annonce = await db
    .collection("annonces")
    .findOne({ _id: new ObjectId(annonceId) }, { projection: { haveImage: 1, firstImagePath: 1 } });
  if (!annonce) throw new NotFoundError("Annonce introuvable");

  const links = await db
    .collection("annonce_images")
    .find({ annonceId: new ObjectId(annonceId) }, { projection: { imageId: 1 } })
    .toArray();
  const imageIds = links.map((l) => l.imageId).filter(Boolean);

  let images: { imagePath: string }[] = [];
  if (imageIds.length) {
    const docs = await db
      .collection("images")
      .find({ _id: { $in: imageIds } }, { projection: { imagePath: 1 } })
      .toArray();
    images = docs.map((d) => ({ imagePath: d.imagePath }));
  }

  return {
    haveImage: Boolean(annonce.haveImage),
    firstImagePath: annonce.firstImagePath ?? null,
    images,
  };
}

// ---------- POST ----------
export async function handlePostImagesReal(
  input: HandlePostImagesInput
): Promise<HandlePostImagesOutput> {
  const { request, annonceId } = input;

  const db = await getDb();
  const cookieUser = await getUserFromCookies();
  let userId = String(cookieUser?.id ?? "");
  if (process.env.NODE_ENV !== "production") {
    const hdr = request.headers.get("x-user-id");
    if (hdr) userId = String(hdr);
  }
  if (!userId) throw new UnauthorizedError();

  if (!ObjectId.isValid(annonceId)) throw new BadRequestError("annonceId invalide");

  const annonce = await db.collection("annonces").findOne({ _id: new ObjectId(annonceId) });
  if (!annonce) throw new NotFoundError("Annonce introuvable");
  if (String(annonce.userId) !== userId) throw new ForbiddenError();

  const form = await request.formData();
  const rawList = [...form.getAll("files"), ...form.getAll("image"), ...form.getAll("images")];
  let mainIndex = Number(form.get("mainIndex") ?? 0);
  const allFiles: File[] = rawList.filter((f): f is File => f instanceof File);
  if (allFiles.length === 0) throw new BadRequestError("Aucun fichier image");
  if (allFiles.length > MAX_FILES) throw new BadRequestError(`Max ${MAX_FILES} images`);
  if (!Number.isFinite(mainIndex) || mainIndex < 0 || mainIndex >= allFiles.length) mainIndex = 0;

  const uploaded: { url: string; contentType: string; key: string }[] = [];
  for (const file of allFiles) {
    if (!ALLOWED_MIME.includes(file.type)) throw new UnsupportedMediaError(`Type non autorisé: ${file.type}`);
    if (file.size > MAX_SIZE_BYTES) throw new PayloadTooLargeError();
    const key = `annonces/${annonceId}/${randomUUID()}-${safeName(file.name || "image")}`;
    const { url } = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
      addRandomSuffix: false,
    });
    uploaded.push({ url, contentType: file.type, key });
  }

  const now = new Date();
  const imageIds: ObjectId[] = [];
  for (const u of uploaded) {
    try {
      const res = await db.collection("images").insertOne({ imagePath: u.url, createdAt: now, altText: null });
      imageIds.push(res.insertedId);
    } catch (e: any) {
      if (e?.code === 11000) {
        const existing = await db
          .collection("images")
          .findOne({ imagePath: u.url }, { projection: { _id: 1 } });
        if (existing?._id) imageIds.push(existing._id);
        else throw e;
      } else throw e;
    }
  }

  const links = imageIds.map((imgId) => ({
    annonceId: new ObjectId(annonceId),
    imageId: imgId,
    createdAt: now,
  }));
  if (links.length) {
    try {
      await db.collection("annonce_images").insertMany(links, { ordered: false });
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
    }
  }

  const mainUrl = uploaded[mainIndex]?.url ?? uploaded[0].url;
  await db.collection("annonces").updateOne(
    { _id: new ObjectId(annonceId) },
    { $set: { haveImage: true, firstImagePath: mainUrl, updatedAt: now } }
  );

  return {
    ok: true,
    images: uploaded.map((u, i) => ({ url: u.url, isMain: i === mainIndex })),
    firstImagePath: mainUrl,
  };
}

// ---------- DELETE ----------
export async function handleDeleteImageReal(
  input: HandleDeleteImageInput
): Promise<HandleDeleteImageOutput> {
  const { request, annonceId } = input;

  const db = await getDb();
  const cookieUser = await getUserFromCookies();
  let userId = String(cookieUser?.id ?? "");
  if (process.env.NODE_ENV !== "production") {
    const hdr = request.headers.get("x-user-id");
    if (hdr) userId = String(hdr);
  }
  if (!userId) throw new UnauthorizedError();

  if (!ObjectId.isValid(annonceId)) throw new BadRequestError("annonceId invalide");

  const annoncesColl = db.collection("annonces");
  const imagesColl = db.collection("images");
  const linksColl = db.collection("annonce_images");

  const annonce = await annoncesColl.findOne(
    { _id: new ObjectId(annonceId) },
    { projection: { _id: 1, userId: 1 } }
  );
  if (!annonce) throw new NotFoundError("Annonce introuvable");
  if (String(annonce.userId) !== userId) throw new ForbiddenError();

  const u = new URL(request.url);
  const imageIdStr = u.searchParams.get("imageId");
  const imageUrl = u.searchParams.get("url");

  let imageId: ObjectId | null = null;
  let imageDoc: any = null;

  if (imageIdStr && ObjectId.isValid(imageIdStr)) {
    imageId = new ObjectId(imageIdStr);
    imageDoc = await imagesColl.findOne({ _id: imageId }, { projection: { _id: 1, imagePath: 1 } });
    if (!imageDoc) throw new NotFoundError("Image introuvable");
  } else if (imageUrl) {
    imageDoc = await imagesColl.findOne({ imagePath: imageUrl }, { projection: { _id: 1, imagePath: 1 } });
    if (!imageDoc) throw new NotFoundError("Image introuvable");
    imageId = imageDoc._id;
  } else {
    throw new BadRequestError("Spécifiez 'url' ou 'imageId'");
  }

  const delRes = await linksColl.deleteOne({
    annonceId: new ObjectId(annonceId),
    imageId: imageId!,
  });
  if (delRes.deletedCount === 0) throw new NotFoundError("Lien non trouvé pour cette annonce");

  const stillLinked = await linksColl.findOne({ imageId: imageId! }, { projection: { _id: 1 } });
  if (!stillLinked) {
    await imagesColl.deleteOne({ _id: imageId! });
  }

  const remainingLinks = await linksColl
    .find({ annonceId: new ObjectId(annonceId) }, { projection: { imageId: 1 } })
    .toArray();
  let remainingUrls: string[] = [];
  if (remainingLinks.length) {
    const ids = remainingLinks.map((l) => l.imageId);
    const imgs = await imagesColl
      .find({ _id: { $in: ids } }, { projection: { imagePath: 1 } })
      .toArray();
    remainingUrls = imgs.map((d) => d.imagePath);
  }

  await annoncesColl.updateOne(
    { _id: new ObjectId(annonceId) },
    {
      $set: {
        haveImage: remainingUrls.length > 0,
        firstImagePath: remainingUrls[0] ?? null,
        updatedAt: new Date(),
      },
    }
  );

  return {
    ok: true,
    removed: imageDoc.imagePath,
    remaining: remainingUrls,
    haveImage: remainingUrls.length > 0,
    firstImagePath: remainingUrls[0] ?? null,
  };
}
