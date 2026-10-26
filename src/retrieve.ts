import type { Citation, DocChunk } from "./types.js";

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9äöüß€$]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function retrieve(
  chunks: DocChunk[],
  query: string,
  k = 8
): Citation[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) {
    return chunks.slice(0, k).map((c) => toCitation(c, 0));
  }

  const scored = chunks.map((c) => {
    const text = c.text.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      if (text.includes(t)) score += 1;
      // light boost for path match
      if (c.relPath.toLowerCase().includes(t)) score += 0.5;
    }
    // prefer denser matches
    score = score / Math.sqrt(qTokens.length);
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, k)
    .map(({ c, score }) => toCitation(c, score));
}

function toCitation(c: DocChunk, score: number): Citation {
  const excerpt =
    c.text.length > 280 ? `${c.text.slice(0, 277).trim()}…` : c.text;
  return {
    path: c.path,
    relPath: c.relPath,
    startLine: c.startLine,
    endLine: c.endLine,
    excerpt,
    score: Math.round(score * 100) / 100,
  };
}

export function formatContext(citations: Citation[]): string {
  return citations
    .map(
      (c, i) =>
        `[${i + 1}] ${c.relPath}:${c.startLine}-${c.endLine}\n${c.excerpt}`
    )
    .join("\n\n");
}
