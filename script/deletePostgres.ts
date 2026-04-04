/**
 * script/deletePostgres.ts
 *
 * Vide toutes les tables PostgreSQL (données uniquement).
 * Le schéma (tables, index, contraintes) est conservé.
 * Les séquences SERIAL sont remises à 1 (RESTART IDENTITY).
 *
 * Usage:
 *   bun --env-file=.env script/deletePostgres.ts
 *   bun --env-file=.env.test script/deletePostgres.ts
 */

import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString });

// Ordre respectant les contraintes FK (enfants avant parents)
const TABLES = [
  "search_logs",
  "favorites",
  "annonce_images",
  "annonce_publication_checklist",
  "annonces",
  "images",
  "user_sessions",
  "password_resets",
  "contacts",
  "users",
  "options",
  "lieux",
];

async function run() {
  const client = await pool.connect();
  try {
    console.log("\n🗑️  Suppression de toutes les données PostgreSQL…\n");

    // Filtrer les tables qui existent réellement (base vierge = première exécution)
    const { rows: existing } = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );
    const existingSet = new Set(existing.map((r) => r.tablename));
    const toTruncate = TABLES.filter((t) => existingSet.has(t));

    if (toTruncate.length === 0) {
      console.log("   ℹ️  Aucune table à vider (base vierge).");
    } else {
      await client.query(
        `TRUNCATE TABLE ${toTruncate.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`
      );
      for (const t of toTruncate) {
        console.log(`   🗑️  ${t} : vidée`);
      }
    }

    // Récupère le nom de la base pour l'affichage
    const { rows } = await client.query("SELECT current_database()");
    const dbName: string = rows[0].current_database;

    console.log(`
╔══════════════════════════════════════════════╗
║  ✅  Delete PostgreSQL complet !             ║
║  Base : ${dbName.padEnd(36)}║
╚══════════════════════════════════════════════╝
`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("❌ deletePostgres failed:", err);
  process.exit(1);
});
