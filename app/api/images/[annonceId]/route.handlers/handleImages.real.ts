import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { db } from "../../../../../lib/db";
import { annonces, images, annonceImages } from "../../../../../lib/schema";
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
  constructor(message = "Non authentifié") { super(message); this.name = "UnauthorizedError"; }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Accès interdit") { super(message); this.name = "ForbiddenError"; }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = "Introuvable") { super(message); this.name = "NotFoundError"; }
}

export class BadRequestError extends Error {
  status = 400;
  constructor(message = "Requête invalide") { super(message); this.name = "BadRequestError"; }
}

export class UnsupportedMediaError extends Error {
  status = 415;
  constructor(message = "Type non autorisé") { super(message); this.name = "UnsupportedMediaError"; }
}

export class PayloadTooLargeError extends Error {
  status = 413;
  constructor(message = "Fichier trop volumineux (>10MB)") { super(message); this.name = "PayloadTooLargeError"; }
}

// ---------- GET ----------
export async function handleGetImagesReal(
  input: HandleGetImagesInput
): Promise<HandleGetImagesOutput> {
  const annonceId = parseInt(String(input.annonceId), 10);
  if (isNaN(annonceId)) throw new BadRequestError("annonceId invalide");

  const [annonce] = await db
    .select({ haveImage: annonces.haveImage, firstImagePath: annonces.firstImagePath })
    .from(annonces)
    .where(eq(annonces.id, annonceId))
    .limit(1);
  if (!annonce) throw new NotFoundError("Annonce introuvable");

  const links = await db
    .select({ imageId: annonceImages.imageId })
    .from(annonceImages)
    .where(eq(annonceImages.annonceId, annonceId));

  const imageIds = links.map((l) => l.imageId);
  let imgs: { imagePath: string }[] = [];
  if (imageIds.length) {
    const docs = await db
      .select({ imagePath: images.imagePath })
      .from(images)
      .where(inArray(images.id, imageIds));
    imgs = docs.map((d) => ({ imagePath: d.imagePath }));
  }

  return {
    haveImage: Boolean(annonce.haveImage),
    firstImagePath: annonce.firstImagePath ?? null,
    images: imgs,
  };
}

// ---------- POST ----------
export async function handlePostImagesReal(
  input: HandlePostImagesInput
): Promise<HandlePostImagesOutput> {
  const { request, annonceId: annonceIdStr } = input;

  const cookieUser = await getUserFromCookies();
  let userId = parseInt(String(cookieUser?.id ?? ""), 10);
  if (process.env.NODE_ENV !== "production") {
    const hdr = request.headers.get("x-user-id");
    if (hdr) userId = parseInt(hdr, 10);
  }
  if (isNaN(userId)) throw new UnauthorizedError();

  const annonceId = parseInt(String(annonceIdStr), 10);
  if (isNaN(annonceId)) throw new BadRequestError("annonceId invalide");

  const [annonce] = await db
    .select({ id: annonces.id, userId: annonces.userId })
    .from(annonces)
    .where(eq(annonces.id, annonceId))
    .limit(1);
  if (!annonce) throw new NotFoundError("Annonce introuvable");
  if (annonce.userId !== userId) throw new ForbiddenError();

  const form = await request.formData();
  const rawList = [...form.getAll("files"), ...form.getAll("image"), ...form.getAll("images")];
  let mainIndex = Number(form.get("mainIndex") ?? 0);
  const allFiles: File[] = rawList.filter((f): f is File => f instanceof File);
  if (allFiles.length === 0) throw new BadRequestError("Aucun fichier image");
  if (allFiles.length > MAX_FILES) throw new BadRequestError(`Max ${MAX_FILES} images`);
  if (!Number.isFinite(mainIndex) || mainIndex < 0 || mainIndex >= allFiles.length) mainIndex = 0;

  const now = new Date();
  const uploaded: { url: string }[] = [];

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
    uploaded.push({ url });
  }

  for (const u of uploaded) {
    const [ins] = await db
      .insert(images)
      .values({ imagePath: u.url, createdAt: now, altText: null })
      .onConflictDoNothing()
      .returning({ id: images.id });

    let imageId: number;
    if (ins) {
      imageId = ins.id;
    } else {
      const [existing] = await db
        .select({ id: images.id })
        .from(images)
        .where(eq(images.imagePath, u.url))
        .limit(1);
      if (!existing) throw new Error("Image insert failed");
      imageId = existing.id;
    }

    await db
      .insert(annonceImages)
      .values({ annonceId, imageId, createdAt: now })
      .onConflictDoNothing();
  }

  const mainUrl = uploaded[mainIndex]?.url ?? uploaded[0].url;
  await db
    .update(annonces)
    .set({ haveImage: true, firstImagePath: mainUrl, updatedAt: now })
    .where(eq(annonces.id, annonceId));

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
  const { request, annonceId: annonceIdStr } = input;

  const cookieUser = await getUserFromCookies();
  let userId = parseInt(String(cookieUser?.id ?? ""), 10);
  if (process.env.NODE_ENV !== "production") {
    const hdr = request.headers.get("x-user-id");
    if (hdr) userId = parseInt(hdr, 10);
  }
  if (isNaN(userId)) throw new UnauthorizedError();

  const annonceId = parseInt(String(annonceIdStr), 10);
  if (isNaN(annonceId)) throw new BadRequestError("annonceId invalide");

  const [annonce] = await db
    .select({ id: annonces.id, userId: annonces.userId })
    .from(annonces)
    .where(eq(annonces.id, annonceId))
    .limit(1);
  if (!annonce) throw new NotFoundError("Annonce introuvable");
  if (annonce.userId !== userId) throw new ForbiddenError();

  const u = new URL(request.url);
  const imageIdStr = u.searchParams.get("imageId");
  const imageUrl = u.searchParams.get("url");

  let imageDoc: { id: number; imagePath: string } | null = null;

  if (imageIdStr) {
    const imageId = parseInt(imageIdStr, 10);
    if (isNaN(imageId)) throw new BadRequestError("imageId invalide");
    const [doc] = await db
      .select({ id: images.id, imagePath: images.imagePath })
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);
    if (!doc) throw new NotFoundError("Image introuvable");
    imageDoc = doc;
  } else if (imageUrl) {
    const [doc] = await db
      .select({ id: images.id, imagePath: images.imagePath })
      .from(images)
      .where(eq(images.imagePath, imageUrl))
      .limit(1);
    if (!doc) throw new NotFoundError("Image introuvable");
    imageDoc = doc;
  } else {
    throw new BadRequestError("Spécifiez 'url' ou 'imageId'");
  }

  const deleted = await db
    .delete(annonceImages)
    .where(and(eq(annonceImages.annonceId, annonceId), eq(annonceImages.imageId, imageDoc.id)))
    .returning({ id: annonceImages.id });
  if (deleted.length === 0) throw new NotFoundError("Lien non trouvé pour cette annonce");

  // Supprimer l'image si elle n'est plus référencée
  const [stillLinked] = await db
    .select({ id: annonceImages.id })
    .from(annonceImages)
    .where(eq(annonceImages.imageId, imageDoc.id))
    .limit(1);
  if (!stillLinked) {
    await db.delete(images).where(eq(images.id, imageDoc.id));
  }

  // Images restantes pour cette annonce
  const remainingLinks = await db
    .select({ imageId: annonceImages.imageId })
    .from(annonceImages)
    .where(eq(annonceImages.annonceId, annonceId));

  let remainingUrls: string[] = [];
  if (remainingLinks.length) {
    const ids = remainingLinks.map((l) => l.imageId);
    const imgs = await db
      .select({ imagePath: images.imagePath })
      .from(images)
      .where(inArray(images.id, ids));
    remainingUrls = imgs.map((d) => d.imagePath);
  }

  await db
    .update(annonces)
    .set({
      haveImage: remainingUrls.length > 0,
      firstImagePath: remainingUrls[0] ?? null,
      updatedAt: new Date(),
    })
    .where(eq(annonces.id, annonceId));

  return {
    ok: true,
    removed: imageDoc.imagePath,
    remaining: remainingUrls,
    haveImage: remainingUrls.length > 0,
    firstImagePath: remainingUrls[0] ?? null,
  };
}
