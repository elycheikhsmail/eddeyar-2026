// lib/db.ts — Connexion PostgreSQL avec Drizzle ORM
// Remplace lib/mongodb.ts
// Utilise le driver `pg` (déjà dans les dépendances) via drizzle-orm/node-postgres

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required — add it to your .env");
}

// Pool de connexions — réutilisé entre les requêtes serverless (même pattern que mongodb.ts)
const globalForPg = global as unknown as { _pgPool?: Pool };

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

const pool = globalForPg._pgPool;

// Instance Drizzle exportée — utiliser dans tous les handlers à la place de getDb()
export const db = drizzle(pool, { schema });

// Export du pool brut si besoin de transactions manuelles
export { pool };
