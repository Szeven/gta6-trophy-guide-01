// Platinum Road — dev server.
// Serves app/ at its root on http://localhost:8080 so the guide can be
// tried in a desktop browser. Static files only, no build step.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "app");
const port = Number(process.env.PORT || 8080);

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = join(appRoot, path);
    if (!file.startsWith(appRoot)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[extname(file)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Platinum Road at http://localhost:${port} (serving ${appRoot})`);
});
