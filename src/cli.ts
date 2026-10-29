#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { askFolder, renderAskMarkdown } from "./ask.js";
import { startUi } from "./serve.js";

function usage(): never {
  console.log(`Desk — local-first AI over a folder of notes

Usage:
  desk ask <folder> <question> [--write-report <path>]
  desk report <folder> --question <q> --out <path>
  desk ui <folder> [--port 3847]

Env:
  GEMINI_API_KEY   required
  GEMINI_MODEL     optional (default gemini-3.6-flash)

Examples:
  npm run desk -- ask ./sample-notes "What are core hours?"
  npm run desk -- report ./sample-notes -q "Summarize decisions" -o ./sample-notes/REPORT.md
  npm run desk -- ui ./sample-notes
`);
  process.exit(1);
}

function takeFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}

function hasFlag(args: string[], name: string): boolean {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === "-h" || argv[0] === "--help") usage();

  const cmd = argv.shift()!;

  if (cmd === "ask") {
    const writeReport =
      takeFlag(argv, "--write-report") || takeFlag(argv, "-o");
    const folder = argv.shift();
    const question = argv.join(" ").trim();
    if (!folder || !question) usage();

    const result = await askFolder(folder, question);
    console.log(result.answer);
    console.log("");
    if (result.citations.length) {
      console.log("Sources:");
      result.citations.forEach((c, i) => {
        console.log(`  [${i + 1}] ${c.relPath}:${c.startLine}-${c.endLine}`);
      });
    }
    if (writeReport) {
      const md = renderAskMarkdown(result, question);
      const out = path.resolve(writeReport);
      await fs.writeFile(out, md, "utf8");
      console.log(`\nWrote report → ${out}`);
    }
    return;
  }

  if (cmd === "report") {
    const question =
      takeFlag(argv, "--question") ||
      takeFlag(argv, "-q") ||
      "Summarize the key decisions and open questions in this folder.";
    const out =
      takeFlag(argv, "--out") ||
      takeFlag(argv, "-o") ||
      "./REPORT.md";
    const folder = argv.shift();
    if (!folder) usage();

    const result = await askFolder(folder, question);
    const md = renderAskMarkdown(result, question);
    const outPath = path.resolve(out);
    await fs.writeFile(outPath, md, "utf8");
    console.log(result.answer);
    console.log(`\nWrote report → ${outPath}`);
    return;
  }

  if (cmd === "ui") {
    const portStr = takeFlag(argv, "--port");
    const port = portStr ? Number(portStr) : 3847;
    const folder = argv.shift() || "./sample-notes";
    if (hasFlag(argv, "--help")) usage();
    await startUi(folder, port);
    // keep alive
    await new Promise(() => {});
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
