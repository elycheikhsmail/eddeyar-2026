import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { db } from "../../../../../lib/db";
import { annonces, contacts, images, annonceImages } from "../../../../../lib/schema";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import {
  HandlePostMyAnnonceInput,
  HandlePostMyAnnonceOutput,
  UnauthorizedError,
  BadRequestError,
} from "./handlePostMyAnnonce.interface";

const MAX_FILES = 8;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function safeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");
}

async function getUserContact(userId: number): Promise<string | null> {
  const [verified] = await db
    .select({ contact: contacts.contact })
    .from(contacts)
    .where(and(eq(contacts.userId, userId), eq(contacts.isVerified, true)))
    .limit(1);
  if (verified?.contact) return verified.contact;

  const [latest] = await db
    .select({ contact: contacts.contact })
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(desc(contacts.createdAt))
    .limit(1);
  return latest?.contact ?? null;
}

async function uploadAndPersistImages(
  annonceId: number,
  files: File[],
  mainIndex: number
): Promise<{ firstImagePath: string | null }> {
  if (files.length > MAX_FILES) throw new Error(`Max ${MAX_FILES} images`);
  if (!Number.isFinite(mainIndex) || mainIndex < 0 || mainIndex >= files.length) mainIndex = 0;

  const now = new Date();
  const uploaded: string[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) throw new Error(`Type non autorisé: ${file.type}`);
    if (file.size > MAX_SIZE_BYTES) throw new Error("Fichier trop volumineux (>10MB)");
    const key = `annonces/${annonceId}/${randomUUID()}-${safeName(file.name || "image")}`;
    const { url } = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
      addRandomSuffix: false,
    });
    uploaded.push(url);
  }

  for (const url of uploaded) {
    const [ins] = await db
      .insert(images)
      .values({ imagePath: url, createdAt: now, altText: null })
      .onConflictDoNothing()
      .returning({ id: images.id });

    let imageId: number;
    if (ins) {
      imageId = ins.id;
    } else {
      const [existing] = await db
        .select({ id: images.id })
        .from(images)
        .where(eq(images.imagePath, url))
        .limit(1);
      if (!existing) throw new Error("Image insert failed");
      imageId = existing.id;
    }

    await db
      .insert(annonceImages)
      .values({ annonceId, imageId, createdAt: now })
      .onConflictDoNothing();
  }

  const firstImagePath = uploaded[mainIndex] ?? uploaded[0];
  await db
    .update(annonces)
    .set({ haveImage: true, firstImagePath, updatedAt: new Date() })
    .where(eq(annonces.id, annonceId));

  return { firstImagePath };
}

export async function handlePostMyAnnonceReal(
  input: HandlePostMyAnnonceInput
): Promise<HandlePostMyAnnonceOutput> {
  const { request } = input;

  const user = await getUserFromCookies();
  const userId = parseInt(String(user?.id ?? ""), 10);
  if (isNaN(userId)) throw new UnauthorizedError();

  const now = new Date();
  const contentType = request.headers.get("content-type") || "";

  // ===== BRANCHE MULTIPART =====
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();

    const typeAnnonceId = parseInt(String(form.get("typeAnnonceId") ?? ""), 10);
    const categorieIdRaw = parseInt(String(form.get("categorieId") ?? ""), 10);
    const categorieId = isNaN(categorieIdRaw) ? typeAnnonceId : categorieIdRaw;
    const subcategorieIdRaw = parseInt(String(form.get("subcategorieId") ?? ""), 10);
    const subcategorieId = isNaN(subcategorieIdRaw) ? null : subcategorieIdRaw;

    const title = String(form.get("title") ?? "");
    const description = String(form.get("description") ?? "");

    const priceRaw = form.get("price");
    const price = priceRaw != null && String(priceRaw) !== "" ? String(Number(priceRaw)) : null;

    const classificationFr = form.get("classificationFr") ? String(form.get("classificationFr")) : null;
    const classificationAr = form.get("classificationAr") ? String(form.get("classificationAr")) : null;
    const issmar = String(form.get("issmar") ?? "false") === "true";
    const directNegotiation = String(form.get("directNegotiation") ?? "false") === "true";

    const lieuIdRaw = parseInt(String(form.get("lieuId") ?? ""), 10);
    const lieuId = isNaN(lieuIdRaw) ? null : lieuIdRaw;
    const moughataaIdRaw = parseInt(String(form.get("moughataaId") ?? ""), 10);
    const moughataaId = isNaN(moughataaIdRaw) ? null : moughataaIdRaw;
    const lieuStr = String(form.get("lieuStr") ?? "") || null;
    const lieuStrAr = String(form.get("lieuStrAr") ?? "") || null;
    const moughataaStr = String(form.get("moughataaStr") ?? "") || null;
    const moughataaStrAr = String(form.get("moughataaStrAr") ?? "") || null;
    const status = String(form.get("status") ?? "active");
    const isPriceHidden = String(form.get("isPriceHidden") ?? "false") === "true";
    const privateDescription = String(form.get("privateDescription") ?? "") || null;
    const rentalPeriod = String(form.get("rentalPeriod") ?? "") || null;
    const rentalPeriodAr = String(form.get("rentalPeriodAr") ?? "") || null;

    const files = [
      ...form.getAll("files"),
      ...form.getAll("image"),
      ...form.getAll("images"),
    ].filter((f): f is File => f instanceof File);

    let mainIndex = Number(String(form.get("mainIndex") ?? "0"));
    if (!Number.isFinite(mainIndex) || mainIndex < 0) mainIndex = 0;

    if (isNaN(typeAnnonceId) || !description) {
      throw new BadRequestError("Champs requis manquants (typeAnnonceId, description)");
    }

    const contact = await getUserContact(userId);
    if (contact === null) throw new BadRequestError("Champs requis manquants (contact)");

    const [inserted] = await db
      .insert(annonces)
      .values({
        typeAnnonceId,
        categorieId,
        subcategorieId,
        userId,
        classificationFr,
        classificationAr,
        title,
        description,
        price,
        rentalPeriod,
        rentalPeriodAr,
        status,
        isPublished: false,
        issmar,
        lieuId,
        lieuStr,
        lieuStrAr,
        contact,
        moughataaId,
        moughataaStr,
        moughataaStrAr,
        haveImage: false,
        directNegotiation,
        isSponsored: false,
        firstImagePath: null,
        isPriceHidden,
        privateDescription,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (files.length > 0) {
      try {
        const { firstImagePath } = await uploadAndPersistImages(inserted.id, files, mainIndex);
        return {
          data: { id: String(inserted.id), haveImage: true, firstImagePath },
          status: 201,
        };
      } catch (e: any) {
        return {
          data: {
            id: String(inserted.id),
            haveImage: false,
            firstImagePath: null,
            uploadError: String(e?.message ?? e),
          },
          status: 201,
        };
      }
    }

    return { data: { ...inserted, id: String(inserted.id) }, status: 201 };
  }

  // ===== BRANCHE JSON =====
  const data = await request.json().catch(() => null);
  if (!data) throw new BadRequestError("Bad payload");

  const required = ["typeAnnonceId", "title", "description", "status"] as const;
  const missing = required.find((k) => {
    const v = data[k];
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  });
  if (missing) throw new BadRequestError(`Champ requis manquant: ${missing}`);

  const typeAnnonceId = parseInt(String(data.typeAnnonceId), 10);
  if (isNaN(typeAnnonceId)) throw new BadRequestError("typeAnnonceId invalide");
  const categorieIdRaw = parseInt(String(data.categorieId ?? ""), 10);
  const categorieId = isNaN(categorieIdRaw) ? typeAnnonceId : categorieIdRaw;

  const contact = await getUserContact(userId);
  if (contact === null) throw new BadRequestError("Champs requis manquants (contact)");

  const [inserted] = await db
    .insert(annonces)
    .values({
      typeAnnonceId,
      categorieId,
      subcategorieId: data.subcategorieId ? parseInt(String(data.subcategorieId), 10) : null,
      userId,
      title: data.title,
      description: data.description,
      price: typeof data.price === "number" ? String(data.price) : null,
      haveImage: Boolean(data.haveImage ?? false),
      firstImagePath: data.firstImagePath ?? null,
      isSponsored: false,
      status: data.status,
      isPublished: false,
      contact,
      lieuId: data.lieuId ? parseInt(String(data.lieuId), 10) : null,
      lieuStr: data.lieuStr ? String(data.lieuStr) : null,
      lieuStrAr: data.lieuStrAr ? String(data.lieuStrAr) : null,
      moughataaId: data.moughataaId ? parseInt(String(data.moughataaId), 10) : null,
      moughataaStr: data.moughataaStr ? String(data.moughataaStr) : null,
      moughataaStrAr: data.moughataaStrAr ? String(data.moughataaStrAr) : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return { data: { ...inserted, id: String(inserted.id) }, status: 201 };
}
