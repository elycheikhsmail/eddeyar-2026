import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getDb } from "../../../../../lib/mongodb";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import {
  HandlePostMyAnnonceInput,
  HandlePostMyAnnonceOutput,
  UnauthorizedError,
  BadRequestError,
} from "./handlePostMyAnnonce.interface";

// ---- Config upload ----
const MAX_FILES = 8;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function safeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");
}

// ---- Contact user ----
async function getUserContact(db: any, userIdStr: string): Promise<string | null> {
  const verified = await db.collection("contacts").findOne(
    { userId: userIdStr },
    { projection: { contact: 1 } }
  );
  if (verified?.contact) return String(verified.contact);

  const latest = await db
    .collection("contacts")
    .find({ userId: userIdStr }, { projection: { contact: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  if (latest?.contact) return String(latest.contact);

  return null;
}

// ---- Upload + persistance DB ----
async function uploadAnnonceImagesAndPersist(
  db: any,
  annonceId: ObjectId,
  files: File[],
  mainIndex: number
) {
  if (files.length === 0) {
    return { images: [] as string[], firstImagePath: null as string | null };
  }
  if (files.length > MAX_FILES) throw new Error(`Max ${MAX_FILES} images`);
  if (!Number.isFinite(mainIndex) || mainIndex < 0 || mainIndex >= files.length) mainIndex = 0;

  const now = new Date();
  const uploaded: { url: string; contentType: string; key: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) throw new Error(`Type non autorisé: ${file.type}`);
    if (file.size > MAX_SIZE_BYTES) throw new Error(`Fichier trop volumineux (>10MB)`);

    const key = `annonces/${annonceId.toString()}/${randomUUID()}-${safeName(file.name || "image")}`;

    const { url } = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
      addRandomSuffix: false,
    });

    uploaded.push({ url, contentType: file.type, key });
  }

  // table images
  const imageIds: ObjectId[] = [];
  for (const u of uploaded) {
    try {
      const res = await db.collection("images").insertOne({
        imagePath: u.url,
        createdAt: now,
        altText: null,
      });
      imageIds.push(res.insertedId);
    } catch (e: any) {
      if (e?.code === 11000) {
        const existing = await db
          .collection("images")
          .findOne({ imagePath: u.url }, { projection: { _id: 1 } });
        if (existing?._id) imageIds.push(existing._id);
        else throw e;
      } else {
        throw e;
      }
    }
  }

  // liens annonce_images
  const links = imageIds.map((imgId) => ({ annonceId, imageId: imgId, createdAt: now }));
  if (links.length) {
    try {
      await db.collection("annonce_images").insertMany(links, { ordered: false });
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
    }
  }

  const firstImagePath = uploaded[mainIndex]?.url ?? uploaded[0].url;
  await db.collection("annonces").updateOne(
    { _id: annonceId },
    { $set: { haveImage: true, firstImagePath, updatedAt: new Date() } }
  );

  return { images: uploaded.map((u) => u.url), firstImagePath };
}

export async function handlePostMyAnnonceReal(
  input: HandlePostMyAnnonceInput
): Promise<HandlePostMyAnnonceOutput> {
  const { request } = input;
  const db = await getDb();

  // ---------- Auth ----------
  const user = await getUserFromCookies();
  console.log("Authenticated user:", user);
  const userIdStr = String(user?.id ?? "");
  if (!userIdStr) {
    throw new UnauthorizedError("Utilisateur non authentifié");
  }

  const now = new Date();
  const contentType = request.headers.get("content-type") || "";

  // ============================================================
  // ========== BRANCHE MULTIPART (wizard Step 3) ===============
  // ============================================================
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();

    const typeAnnonceId = String(form.get("typeAnnonceId") ?? "");
    const categorieId = form.get("categorieId") ? String(form.get("categorieId")) : null;
    const subcategorieId = form.get("subcategorieId") ? String(form.get("subcategorieId")) : null;
    const title = String(form.get("title") ?? "");
    const description = String(form.get("description") ?? "");
    const rentalPeriod = String(form.get("rentalPeriod") ?? "");
    const rentalPeriodAr = String(form.get("rentalPeriodAr") ?? "");
    const typeAnnonceName = String(form.get("typeAnnonceName") ?? "");
    const categorieName = String(form.get("categorieName") ?? "");
    const typeAnnonceNameAr = String(form.get("typeAnnonceNameAr") ?? "");
    const categorieNameAr = String(form.get("categorieNameAr") ?? "");

    console.log("Form data received:", rentalPeriod);

    const priceStr = form.get("price");
    const price = priceStr != null && String(priceStr) !== "" ? Number(priceStr) : null;

    const classificationFr = form.get("classificationFr")
      ? String(form.get("classificationFr"))
      : null;
    const classificationAr = form.get("classificationAr")
      ? String(form.get("classificationAr"))
      : null;
    const issmar = String(form.get("issmar") ?? "false") === "true";
    const directNegotiation = String(form.get("directNegotiation") ?? "false") === "true";

    const lieuId = String(form.get("lieuId") ?? "");
    const moughataaId = String(form.get("moughataaId") ?? "");
    const lieuStr = String(form.get("lieuStr") ?? "");
    const lieuStrAr = String(form.get("lieuStrAr") ?? "");
    const moughataaStr = String(form.get("moughataaStr") ?? "");
    const moughataaStrAr = String(form.get("moughataaStrAr") ?? "");
    const status = String(form.get("status") ?? "active");
    const isPriceHidden = String(form.get("isPriceHidden") ?? "false") === "true";
    const privateDescription = String(form.get("privateDescription") ?? "");

    const files = [
      ...form.getAll("files"),
      ...form.getAll("image"),
      ...form.getAll("images"),
    ].filter((f): f is File => f instanceof File);

    let mainIndex = Number(String(form.get("mainIndex") ?? "0"));
    if (!Number.isFinite(mainIndex) || mainIndex < 0) mainIndex = 0;

    if (!typeAnnonceId || !description) {
      throw new BadRequestError("Champs requis manquants (type, description)");
    }

    console.log("Creating annonce for userId:", userIdStr);
    const contact = await getUserContact(db, userIdStr);

    if (contact === null) {
      throw new BadRequestError("Champs requis manquants (contact)");
    }

    console.log("User contact:", contact);

    const annonceDoc: any = {
      typeAnnonceId,
      categorieId,
      subcategorieId,
      userId: userIdStr,
      classificationFr,
      classificationAr,
      title,
      description,
      price,
      rentalPeriod,
      rentalPeriodAr,
      typeAnnonceName,
      categorieName,
      typeAnnonceNameAr,
      categorieNameAr,
      status,
      isPublished: false,
      issmar,
      lieuId: lieuId || null,
      lieuStr: lieuStr || null,
      lieuStrAr: lieuStrAr || null,
      contact,
      moughataaId: moughataaId || null,
      moughataaStr: moughataaStr || null,
      moughataaStrAr: moughataaStrAr || null,
      haveImage: false,
      directNegotiation,
      isSponsored: false,
      firstImagePath: "",
      isPriceHidden,
      privateDescription,
      createdAt: now,
      updatedAt: now,
    };

    console.log("Creating annonce:", annonceDoc, { filesCount: files.length, mainIndex });

    let insertedId: ObjectId;
    try {
      const insertRes = await db.collection("annonces").insertOne(annonceDoc);
      console.log("insertRes : ", insertRes);
      insertedId = insertRes.insertedId as ObjectId;
    } catch (e: any) {
      if (e?.code === 11000) {
        const existing = await db
          .collection("annonces")
          .findOne({ userId: userIdStr }, { projection: { _id: 1, haveImage: 1, firstImagePath: 1 } });
        if (existing?._id) {
          return {
            data: {
              id: existing._id.toString(),
              haveImage: existing.haveImage ?? false,
              firstImagePath: existing.firstImagePath ?? null,
            },
            status: 201,
          };
        }
      }
      throw e;
    }

    if (files.length > 0) {
      try {
        const { firstImagePath } = await uploadAnnonceImagesAndPersist(
          db,
          insertedId,
          files,
          mainIndex
        );
        return {
          data: { id: insertedId.toString(), ...annonceDoc, haveImage: true, firstImagePath },
          status: 201,
        };
      } catch (e: any) {
        return {
          data: {
            id: insertedId.toString(),
            ...annonceDoc,
            haveImage: false,
            firstImagePath: null,
            uploadError: String(e?.message ?? e),
          },
          status: 201,
        };
      }
    }

    return { data: { id: insertedId.toString(), ...annonceDoc }, status: 201 };
  }

  // ============================================================
  // ========== BRANCHE JSON (facultative) ======================
  // ============================================================
  const data = await request.json().catch(() => null);
  if (!data) throw new BadRequestError("Bad payload");

  const required = ["typeAnnonceId", "title", "description", "status"] as const;
  const missing = required.find((k) => {
    const v = data[k];
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  });
  if (missing) {
    throw new BadRequestError(`Champ requis manquant: ${missing}`);
  }

  const annonceDoc = {
    typeAnnonceId: String(data.typeAnnonceId),
    categorieId: data.categorieId ? String(data.categorieId) : null,
    subcategorieId: data.subcategorieId ? String(data.subcategorieId) : null,
    userId: userIdStr,
    title: data.title,
    description: data.description,
    price: typeof data.price === "number" ? data.price : null,
    haveImage: Boolean(data.haveImage ?? false),
    firstImagePath: data.firstImagePath ?? "",
    isSponsored: false,
    status: data.status,
    isPublished: false,
    lieuId: data.lieuId ? String(data.lieuId) : null,
    lieuStr: data.lieuStr ? String(data.lieuStr) : null,
    lieuStrAr: data.lieuStrAr ? String(data.lieuStrAr) : null,
    moughataaId: data.moughataaId ? String(data.moughataaId) : null,
    moughataaStr: data.moughataaStr ? String(data.moughataaStr) : null,
    moughataaStrAr: data.moughataaStrAr ? String(data.moughataaStrAr) : null,
    createdAt: now,
    updatedAt: now,
  };

  let insertedId: ObjectId;
  try {
    const result = await db.collection("annonces").insertOne(annonceDoc);
    insertedId = result.insertedId as ObjectId;
  } catch (e: any) {
    if (e?.code === 11000) {
      const existing = await db
        .collection("annonces")
        .findOne({ userId: userIdStr }, { projection: { _id: 1, haveImage: 1, firstImagePath: 1 } });
      if (existing?._id) {
        return {
          data: {
            id: existing._id.toString(),
            haveImage: existing.haveImage ?? false,
            firstImagePath: existing.firstImagePath ?? null,
          },
          status: 201,
        };
      }
    }
    throw e;
  }

  return { data: { ...annonceDoc, id: insertedId.toString() }, status: 201 };
}
