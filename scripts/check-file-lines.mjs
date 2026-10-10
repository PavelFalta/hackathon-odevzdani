#!/usr/bin/env node
/**
 * Enforces max physical line count per source file (blank lines count).
 * Keep files small — split modules before hitting the limit.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const LIMITS = {
  default: 200,
  test: 350,
};

const SCAN = [
  { dir: "frontend/src", ext: [".ts", ".tsx"] },
  { dir: "backend/app", ext: [".py"] },
  { dir: "backend/tests", ext: [".py"] },
];

const SKIP_DIRS = new Set(["node_modules", ".venv", "dist", "build", "__pycache__"]);

async function walk(dir, ext, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(full, ext, out);
      continue;
    }
    if (!ext.some((e) => ent.name.endsWith(e))) continue;
    const st = await stat(full);
    if (!st.isFile()) continue;
    out.push(full);
  }
}

function limitFor(file) {
  if (file.includes(".test.") || file.includes("/tests/")) return LIMITS.test;
  return LIMITS.default;
}

async function main() {
  const files = [];
  for (const { dir, ext } of SCAN) {
    const abs = path.join(ROOT, dir);
    const batch = [];
    await walk(abs, ext, batch);
    for (const f of batch) files.push(f);
  }

  const violations = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const lines = text.split("\n").length;
    const max = limitFor(file);
    if (lines > max) {
      violations.push({ file: path.relative(ROOT, file), lines, max });
    }
  }

  if (violations.length) {
    console.error("File line count limit exceeded:\n");
    for (const v of violations.sort((a, b) => b.lines - a.lines)) {
      console.error(`  ${v.file}: ${v.lines} lines (max ${v.max})`);
    }
    console.error(
      `\nTarget ~120 lines per module when possible. Split before you hit the limit.\n`,
    );
    process.exit(1);
  }
  console.log(`check-file-lines: OK (${files.length} files)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
