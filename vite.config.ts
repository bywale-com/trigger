import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { currentSnapshot } from "./src/observe/refresh.ts";
import { treeFileResult } from "./src/observe/tree-file.ts";

function towerApi() {
  const handle = async (
    request: { url?: string },
    response: {
      statusCode?: number;
      setHeader: (name: string, value: string) => void;
      end: (body: string | Buffer) => void;
    },
    next: () => void,
  ) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (url.pathname === "/api/tree-file") {
      const result = await treeFileResult(url.searchParams.get("path"));
      response.statusCode = result.status;
      response.setHeader("content-type", result.contentType);
      if (result.cacheControl) response.setHeader("cache-control", result.cacheControl);
      response.end(result.body);
      return;
    }
    if (url.pathname !== "/api/snapshot") return next();
    const body = await currentSnapshot();
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify(body));
  };
  return {
    name: "tower-api",
    configureServer(server: { middlewares: { use: (fn: typeof handle) => void } }) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof handle) => void } }) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig({
  plugins: [react(), towerApi()],
  test: { environment: "node" },
});
