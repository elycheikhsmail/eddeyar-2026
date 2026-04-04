// script/migratePostgres.ts — Applique les migrations Drizzle en production
// Usage : bun --env-file=.env script/migratePostgres.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
  console.log("🚀 Running PostgreSQL migrations...");
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("✅ Migrations applied.");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
