import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { currentSnapshot } from "./src/observe/refresh.ts";

function towerApi() {
  const handle = async (
    request: { url?: string },
    response: { setHeader: (name: string, value: string) => void; end: (body: string) => void },
    next: () => void,
  ) => {
    const path = request.url?.split("?")[0];
    if (path !== "/api/snapshot") return next();
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
