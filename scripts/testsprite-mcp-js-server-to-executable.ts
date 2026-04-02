/**
 * scripts/testsprite-mcp-js-server-to-executable.ts
 *
 * Converts @testsprite/testsprite-mcp JS server into a native executable
 * for the CURRENT OS (Windows → .exe, Linux → ELF binary).
 *
 * Usage:
 *   bun run testsprite:build
 *   # or directly:
 *   bun scripts/testsprite-mcp-js-server-to-executable.ts
 *
 * Output:
 *   Windows : .claude/bin/testsprite-mcp.exe
 *   Linux   : .claude/bin/testsprite-mcp-linux
 */

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const BIN_DIR = join(PROJECT_ROOT, ".claude", "bin");
const PACKAGE_NAME = "@testsprite/testsprite-mcp";

const platform = process.platform; // "win32" | "linux" | "darwin"

console.log(`🖥️  OS détecté : ${platform}`);

// ── 1. Ensure .claude/bin/ exists ──────────────────────────────────────────
if (!existsSync(BIN_DIR)) {
  mkdirSync(BIN_DIR, { recursive: true });
  console.log(`📁 Créé : ${BIN_DIR}`);
}

// ── 2. Install package locally if not present ──────────────────────────────
const localPackageDir = join(PROJECT_ROOT, "node_modules", "@testsprite", "testsprite-mcp");
if (!existsSync(localPackageDir)) {
  console.log(`📦 Installation de ${PACKAGE_NAME}...`);
  await $`bun add -d ${PACKAGE_NAME}`.cwd(PROJECT_ROOT);
  console.log(`✅ Installé`);
} else {
  console.log(`✅ ${PACKAGE_NAME} déjà installé`);
}

// ── 3. Find entrypoint ─────────────────────────────────────────────────────
const entrypoint = join(localPackageDir, "dist", "index.js");
if (!existsSync(entrypoint)) {
  console.error(`❌ Entrypoint introuvable : ${entrypoint}`);
  process.exit(1);
}
console.log(`🎯 Entrypoint : ${entrypoint}`);

// ── 4. Compile for current OS only ─────────────────────────────────────────
if (platform === "win32") {
  const outfile = join(BIN_DIR, "testsprite-mcp.exe");
  console.log(`\n🔨 Compilation pour Windows...`);
  await $`bun build --compile --target=bun-windows-x64 ${entrypoint} --outfile ${outfile}`.cwd(PROJECT_ROOT);
  console.log(`✅ Binaire Windows : ${outfile}`);

} else if (platform === "linux") {
  const outfile = join(BIN_DIR, "testsprite-mcp-linux");
  console.log(`\n🔨 Compilation pour Linux...`);
  await $`bun build --compile --target=bun-linux-x64 ${entrypoint} --outfile ${outfile}`.cwd(PROJECT_ROOT);
  console.log(`✅ Binaire Linux : ${outfile}`);

} else {
  console.error(`❌ OS non supporté : ${platform}. Seuls Windows et Linux sont supportés.`);
  process.exit(1);
}

console.log(`\n🎉 Terminé ! Binaire dans .claude/bin/`);
console.log(`ℹ️  Le runner (scripts/testsprite-mcp-runner.ts) sélectionne automatiquement ce binaire.`);
