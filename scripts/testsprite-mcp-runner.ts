/**
 * scripts/testsprite-mcp-runner.ts
 *
 * Bun shell script — selects and runs the correct TestSprite MCP binary
 * based on the current OS, with fallback to bunx if binary is missing.
 *
 * Usage (in .mcp.json):
 *   {
 *     "command": "bun",
 *     "args": ["scripts/testsprite-mcp-runner.ts"]
 *   }
 *
 * To build the binaries first:
 *   bun scripts/build-testsprite-executable.ts
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { resolve, join } from "path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const BIN_DIR = join(PROJECT_ROOT, ".claude", "bin");

const platform = process.platform; // "win32" | "linux" | "darwin"

const binaryPath =
  platform === "win32"
    ? join(BIN_DIR, "testsprite-mcp.exe")
    : join(BIN_DIR, "testsprite-mcp-linux");

if (existsSync(binaryPath)) {
  // ── Fast path: run native executable ──────────────────────────────────────
  process.stderr.write(`[testsprite-runner] Running native binary: ${binaryPath}\n`);
  const proc = Bun.spawn([binaryPath, ...process.argv.slice(2)], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  });
  process.exit(await proc.exited);
} else {
  // ── Fallback: bunx (slower, downloads package on first cold start) ─────────
  process.stderr.write(
    `[testsprite-runner] Binary not found at ${binaryPath}\n` +
    `[testsprite-runner] Falling back to bunx (run build script to create binary)\n`
  );
  const proc = Bun.spawn(
    ["bunx", "@testsprite/testsprite-mcp@latest", ...process.argv.slice(2)],
    {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      env: process.env,
    }
  );
  process.exit(await proc.exited);
}
