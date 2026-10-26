import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { askFolder } from "./ask.js";
import { resolveFolder } from "./scan.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "../public");

function send(res: http.ServerResponse, status: number, body: string, type: string) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

export async function startUi(folderArg: string, port = 3847): Promise<void> {
  const folder = await resolveFolder(folderArg);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);

      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        const html = await fs.readFile(path.join(PUBLIC, "index.html"), "utf8");
        return send(res, 200, html, "text/html; charset=utf-8");
      }

      if (req.method === "GET" && url.pathname === "/api/meta") {
        return send(
          res,
          200,
          JSON.stringify({ folder, port }),
          "application/json"
        );
      }

      if (req.method === "POST" && url.pathname === "/api/ask") {
        const raw = await readBody(req);
        const body = JSON.parse(raw || "{}") as { question?: string };
        const question = (body.question || "").trim();
        if (!question) {
          return send(res, 400, JSON.stringify({ error: "question required" }), "application/json");
        }
        const result = await askFolder(folder, question);
        return send(res, 200, JSON.stringify(result), "application/json");
      }

      send(res, 404, "not found", "text/plain");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      send(res, 500, JSON.stringify({ error: msg }), "application/json");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });

  console.log(`Desk UI → http://127.0.0.1:${port}`);
  console.log(`Folder  → ${folder}`);
  console.log(`Ctrl+C to stop`);
}
