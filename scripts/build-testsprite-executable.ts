/**
 * scripts/build-testsprite-executable.ts
 *
 * Compiles @testsprite/testsprite-mcp into standalone native executables
 * for Windows and Linux using Bun's compile feature.
 *
 * Usage:
 *   bun scripts/build-testsprite-executable.ts
 *
 * Output:
 *   .claude/bin/testsprite-mcp.exe   (Windows)
 *   .claude/bin/testsprite-mcp       (Linux)
 */

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const BIN_DIR = join(PROJECT_ROOT, ".claude", "bin");
const PACKAGE_NAME = "@testsprite/testsprite-mcp";

// ── 1. Ensure .claude/bin/ exists ──────────────────────────────────────────
if (!existsSync(BIN_DIR)) {
  mkdirSync(BIN_DIR, { recursive: true });
  console.log(`📁 Created ${BIN_DIR}`);
}

// ── 2. Install package locally if not present ──────────────────────────────
const localPackageDir = join(PROJECT_ROOT, "node_modules", "@testsprite", "testsprite-mcp");
if (!existsSync(localPackageDir)) {
  console.log(`📦 Installing ${PACKAGE_NAME}...`);
  await $`bun add -d ${PACKAGE_NAME}`.cwd(PROJECT_ROOT);
  console.log(`✅ Installed`);
} else {
  console.log(`✅ ${PACKAGE_NAME} already installed`);
}

// ── 3. Find entrypoint ─────────────────────────────────────────────────────
const entrypoint = join(localPackageDir, "dist", "index.js");
if (!existsSync(entrypoint)) {
  console.error(`❌ Entrypoint not found: ${entrypoint}`);
  process.exit(1);
}
console.log(`🎯 Entrypoint: ${entrypoint}`);

// ── 4. Compile for Windows ─────────────────────────────────────────────────
const winOutput = join(BIN_DIR, "testsprite-mcp.exe");
console.log(`\n🔨 Compiling for Windows (bun-windows-x64)...`);
try {
  await $`bun build --compile --target=bun-windows-x64 ${entrypoint} --outfile ${winOutput}`.cwd(PROJECT_ROOT);
  console.log(`✅ Windows binary: ${winOutput}`);
} catch (e) {
  console.error(`❌ Windows build failed: ${e}`);
}

// ── 5. Compile for Linux ───────────────────────────────────────────────────
const linuxOutput = join(BIN_DIR, "testsprite-mcp-linux");
console.log(`\n🔨 Compiling for Linux (bun-linux-x64)...`);
try {
  await $`bun build --compile --target=bun-linux-x64 ${entrypoint} --outfile ${linuxOutput}`.cwd(PROJECT_ROOT);
  console.log(`✅ Linux binary: ${linuxOutput}`);
} catch (e) {
  console.error(`❌ Linux build failed: ${e}`);
}

console.log(`\n🎉 Done! Binaries in .claude/bin/`);
console.log(`   Windows : .claude/bin/testsprite-mcp.exe`);
console.log(`   Linux   : .claude/bin/testsprite-mcp`);
console.log(`\nUpdate .mcp.json to use: bun scripts/testsprite-mcp-runner.ts`);
