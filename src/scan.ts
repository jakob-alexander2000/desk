import fs from "node:fs/promises";
import path from "node:path";
import type { DocChunk } from "./types.js";

const TEXT_EXT = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".rst",
  ".org",
  ".csv",
  ".json",
  ".yml",
  ".yaml",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".venv",
  "venv",
  "__pycache__",
]);

const MAX_FILE_BYTES = 400_000;
const MAX_FILES = 200;

export async function resolveFolder(folder: string): Promise<string> {
  const abs = path.resolve(folder);
  const st = await fs.stat(abs);
  if (!st.isDirectory()) {
    throw new Error(`Not a directory: ${abs}`);
  }
  return abs;
}

async function walk(dir: string, root: string, out: string[]): Promise<void> {
  if (out.length >= MAX_FILES) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (out.length >= MAX_FILES) return;
    if (ent.name.startsWith(".") && ent.name !== ".env.example") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(full, root, out);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (!TEXT_EXT.has(ext)) continue;
      out.push(full);
    }
  }
}

export async function listTextFiles(folder: string): Promise<string[]> {
  const files: string[] = [];
  await walk(folder, folder, files);
  return files.sort();
}

function chunkText(
  relPath: string,
  absPath: string,
  content: string,
  targetChars = 900
): DocChunk[] {
  const lines = content.split(/\r?\n/);
  const chunks: DocChunk[] = [];
  let buf: string[] = [];
  let startLine = 1;
  let chars = 0;

  const flush = (endLine: number) => {
    const text = buf.join("\n").trim();
    if (!text) return;
    chunks.push({
      id: `${relPath}:${startLine}-${endLine}`,
      path: absPath,
      relPath,
      startLine,
      endLine,
      text,
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (buf.length === 0) startLine = i + 1;
    buf.push(line);
    chars += line.length + 1;
    const blank = line.trim() === "";
    if (chars >= targetChars && blank) {
      flush(i + 1);
      buf = [];
      chars = 0;
    }
  }
  if (buf.length) flush(lines.length);
  return chunks;
}

export async function loadChunks(folder: string): Promise<{
  chunks: DocChunk[];
  fileCount: number;
}> {
  const files = await listTextFiles(folder);
  const chunks: DocChunk[] = [];
  for (const abs of files) {
    const st = await fs.stat(abs);
    if (st.size > MAX_FILE_BYTES) continue;
    const content = await fs.readFile(abs, "utf8");
    const rel = path.relative(folder, abs);
    chunks.push(...chunkText(rel, abs, content));
  }
  return { chunks, fileCount: files.length };
}
