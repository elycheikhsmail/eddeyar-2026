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

    // TRUNCATE en cascade avec reset des séquences SERIAL
    await client.query(
      `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`
    );

    for (const t of TABLES) {
      console.log(`   🗑️  ${t} : vidée`);
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
