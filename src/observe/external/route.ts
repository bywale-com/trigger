/** Local and test dispatch. The desk snapshot route is not part of this surface. */
import type { IncomingMessage, ServerResponse } from "node:http";
import { safeError, sendError } from "./http.ts";
import { handleMcp, type McpDeps } from "./mcp.ts";
import { handleAuthorizationServer, handleAuthorize, handleProtectedResource, handleRegister, handleToken, type OauthDeps } from "./oauth.ts";
import { handleV1, type V1Deps } from "./v1.ts";

export type ExternalDeps = V1Deps & McpDeps & OauthDeps;

export function isExternalPath(pathname: string): boolean {
  return (
    pathname === "/api/mcp" ||
    pathname === "/api/v1" ||
    pathname.startsWith("/api/v1/") ||
    pathname.startsWith("/api/oauth/") ||
    pathname.startsWith("/.well-known/oauth-protected-resource") ||
    pathname.startsWith("/.well-known/oauth-authorization-server")
  );
}

export async function handleExternal(req: IncomingMessage, res: ServerResponse, deps: ExternalDeps = {}): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const path = url.pathname;
  try {
    if (path === "/api/mcp") return await handleMcp(req, res, deps);
    if (path === "/api/v1" || path.startsWith("/api/v1/")) return await handleV1(req, res, deps);
    if (path === "/api/oauth/authorize") return await handleAuthorize(req, res, deps);
    if (path === "/api/oauth/token") return await handleToken(req, res, deps);
    if (path === "/api/oauth/register") return await handleRegister(req, res, deps);
    if (path.startsWith("/.well-known/oauth-protected-resource")) return await handleProtectedResource(req, res);
    if (path.startsWith("/.well-known/oauth-authorization-server")) return await handleAuthorizationServer(req, res);
    sendError(res, "not_found", "Unknown external route.");
  } catch (error) {
    console.error(`external failed: ${safeError(error)}`);
    sendError(res, "internal", "The request failed.");
  }
}
