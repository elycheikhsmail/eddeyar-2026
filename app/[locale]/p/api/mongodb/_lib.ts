// app/[locale]/p/api/mongodb/_lib.ts
// Couche d'accès aux tables `options` et `lieux` — Drizzle ORM (PostgreSQL)
// Remplace l'ancienne implémentation MongoDB

import { eq, and, asc, isNull } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { options, lieux } from "../../../../../lib/schema";

// ---------------------------------------------------------------------------
// Types publics (mêmes noms qu'avant pour ne pas casser les imports)
// ---------------------------------------------------------------------------

export type OptionApiDocument = {
  id: number;
  name: string;
  nameAr: string | null;
  priority: number;
  tag: string | null;
  depth: number;
  parentID: number | null;
};

// ---------------------------------------------------------------------------
// Requêtes OPTIONS
// ---------------------------------------------------------------------------

export async function getOptions(parentId: number | null): Promise<OptionApiDocument[]> {
  const rows =
    parentId === null
      ? await db
          .select()
          .from(options)
          .where(eq(options.depth, 1))
          .orderBy(asc(options.id))
      : await db
          .select()
          .from(options)
          .where(eq(options.parentId, parentId))
          .orderBy(asc(options.id));

  return rows.map(toOptionApi);
}

export async function createOption(data: {
  name: string;
  nameAr: string | null;
  priority: number;
  tag: string | null;
  depth: number;
  parentId: number | null;
}): Promise<OptionApiDocument> {
  const [inserted] = await db
    .insert(options)
    .values({
      name: data.name,
      nameAr: data.nameAr ?? "",
      priority: data.priority,
      tag: data.tag ?? "",
      depth: data.depth,
      parentId: data.parentId,
      createdAt: new Date(),
    })
    .returning();
  return toOptionApi(inserted);
}

export async function updateOption(
  id: number,
  data: {
    name: string;
    nameAr: string | null;
    priority: number;
    tag: string | null;
    depth: number;
    parentId: number | null;
  }
): Promise<OptionApiDocument | null> {
  await db
    .update(options)
    .set({
      name: data.name,
      nameAr: data.nameAr ?? "",
      priority: data.priority,
      tag: data.tag ?? "",
      depth: data.depth,
      parentId: data.parentId,
    })
    .where(eq(options.id, id));

  const [updated] = await db
    .select()
    .from(options)
    .where(eq(options.id, id))
    .limit(1);

  return updated ? toOptionApi(updated) : null;
}

// ---------------------------------------------------------------------------
// Requêtes LIEUX
// ---------------------------------------------------------------------------

export async function getLieux(parentId: number | null): Promise<OptionApiDocument[]> {
  const rows =
    parentId === null
      ? await db
          .select()
          .from(lieux)
          .where(eq(lieux.depth, 1))
          .orderBy(asc(lieux.id))
      : await db
          .select()
          .from(lieux)
          .where(eq(lieux.parentId, parentId))
          .orderBy(asc(lieux.id));

  return rows.map(toLieuApi);
}

export async function createLieu(data: {
  name: string;
  nameAr: string | null;
  priority: number;
  depth: number;
  parentId: number | null;
}): Promise<OptionApiDocument> {
  const [inserted] = await db
    .insert(lieux)
    .values({
      name: data.name,
      nameAr: data.nameAr ?? "",
      priority: data.priority,
      depth: data.depth,
      parentId: data.parentId,
    })
    .returning();
  return toLieuApi(inserted);
}

export async function updateLieu(
  id: number,
  data: {
    name: string;
    nameAr: string | null;
    priority: number;
    depth: number;
    parentId: number | null;
  }
): Promise<OptionApiDocument | null> {
  await db
    .update(lieux)
    .set({
      name: data.name,
      nameAr: data.nameAr ?? "",
      priority: data.priority,
      depth: data.depth,
      parentId: data.parentId,
    })
    .where(eq(lieux.id, id));

  const [updated] = await db
    .select()
    .from(lieux)
    .where(eq(lieux.id, id))
    .limit(1);

  return updated ? toLieuApi(updated) : null;
}

// ---------------------------------------------------------------------------
// Mappers internes
// ---------------------------------------------------------------------------

function toOptionApi(row: typeof options.$inferSelect): OptionApiDocument {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.nameAr ?? null,
    priority: row.priority,
    tag: row.tag ?? null,
    depth: row.depth,
    parentID: row.parentId ?? null,
  };
}

function toLieuApi(row: typeof lieux.$inferSelect): OptionApiDocument {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.nameAr ?? null,
    priority: row.priority,
    tag: null,
    depth: row.depth,
    parentID: row.parentId ?? null,
  };
}

// ---------------------------------------------------------------------------
// Utilitaires purs (inchangés)
// ---------------------------------------------------------------------------

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toNumberOrDefault(value: unknown, defaultValue: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
