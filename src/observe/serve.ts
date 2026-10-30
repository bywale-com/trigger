import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { currentSnapshot } from "./refresh.ts";

const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const dist = join(process.cwd(), "dist");

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/api/snapshot") {
    const body = await currentSnapshot();
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
    return;
  }
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = normalize(join(dist, pathname));
  if (!file.startsWith(dist)) {
    response.writeHead(403);
    response.end();
    return;
  }
  try {
    await access(file);
  } catch {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`http://${host}:${port}`);
});
