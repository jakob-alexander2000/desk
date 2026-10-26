export type DocChunk = {
  id: string;
  path: string;
  relPath: string;
  startLine: number;
  endLine: number;
  text: string;
};

export type Citation = {
  path: string;
  relPath: string;
  startLine: number;
  endLine: number;
  excerpt: string;
  score: number;
};

export type AskResult = {
  answer: string;
  citations: Citation[];
  model: string;
  folder: string;
  fileCount: number;
  chunkCount: number;
  usedChunks: number;
};
