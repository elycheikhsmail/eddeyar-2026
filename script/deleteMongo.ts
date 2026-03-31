/**
 * script/deleteMongo.ts
 *
 * Supprime toutes les données de la base (collections vidées).
 * La structure (index, validators) est conservée.
 *
 * Usage:
 *   pnpm run mongo:delete          # base principale (.env)
 *   pnpm run mongo:delete:test     # base de test (.env.test)
 */

import { MongoClient } from "mongodb";
import "dotenv/config";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env var ${name} is required`);
  return v;
}

const COLLECTIONS = [
  "lieux",
  "options",
  "counters",
  "users",
  "contacts",
  "user_sessions",
  "annonces",
  "annonce_publication_checklist",
  "images",
];

async function run() {
  const uri = requiredEnv("DATABASE_URL");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`\n🔗 Connected to: ${db.databaseName}\n`);
    console.log("🗑️  Deleting all data…\n");

    for (const name of COLLECTIONS) {
      const col = db.collection(name);
      const result = await col.deleteMany({});
      console.log(`   🗑️  ${name}: ${result.deletedCount} documents deleted`);
    }

    console.log(`
╔══════════════════════════════════════════════╗
║  ✅  Delete complete!                        ║
║  Base : ${db.databaseName.padEnd(36)}║
╚══════════════════════════════════════════════╝
`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("❌ deleteMongo failed:", err);
  process.exit(1);
});
