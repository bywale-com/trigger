import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import authorizationServer from "../../../api/oauth/authorization-server.ts";
import protectedResource from "../../../api/oauth/protected-resource.ts";

const entries = [
  "protected-resource.ts",
  "authorization-server.ts",
  "authorize.ts",
  "token.ts",
  "register.ts",
];

describe("oauth function entries", () => {
  it("keeps static Node imports so the Vercel compiler can rewrite them", () => {
    for (const file of entries) {
      const source = readFileSync(join(import.meta.dirname, "../../../api/oauth", file), "utf8");
      expect(source, file).toContain('runtime: "nodejs"');
      expect(source, file).not.toContain("import(");
      expect(source, file).not.toContain("nodejs20");
      expect(source, file).toContain("../../src/observe/external/oauth.ts");
    }
  });

  it("serves protected-resource and authorization-server metadata", async () => {
    const server = createServer((req, res) => {
      const handle = req.url?.includes("authorization-server") ? authorizationServer : protectedResource;
      void handle(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const origin = `http://127.0.0.1:${port}`;
    try {
      const resource = await fetch(`${origin}/.well-known/oauth-protected-resource`);
      expect(resource.status).toBe(200);
      expect(await resource.json()).toMatchObject({
        resource: `${origin}/api/mcp`,
        authorization_servers: [origin],
        scopes_supported: ["trigger:read"],
      });
      const metadata = await fetch(`${origin}/.well-known/oauth-authorization-server`);
      expect(metadata.status).toBe(200);
      expect(await metadata.json()).toMatchObject({
        issuer: origin,
        authorization_endpoint: `${origin}/api/oauth/authorize`,
        token_endpoint: `${origin}/api/oauth/token`,
        code_challenge_methods_supported: ["S256"],
      });
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});
