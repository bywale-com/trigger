/**
 * Stateless OAuth 2.1 for the read scope.
 * The authorize page requires the operator read token. Nothing is auto-approved.
 * Codes and tokens are HMAC signed. There is no client database.
 * Write scopes are not granted.
 */
import { createHash, randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  configuredReadToken,
  freshExpiry,
  newJti,
  OFFLINE_SCOPE,
  READ_SCOPE,
  readToken,
  scopeAllowed,
  signToken,
  signingSecret,
  tokensMatch,
} from "./auth.ts";
import {
  applyCors,
  mcpResource,
  mediaType,
  readRaw,
  requestOrigin,
  sendError,
  sendJson,
  type Limit,
  sharedLimit,
} from "./http.ts";

const CODE_TTL = 120;
const ACCESS_TTL = 60 * 60;
const REFRESH_TTL = 14 * 24 * 60 * 60;
const CIMD_HOSTS = new Set(["chatgpt.com", "claude.ai", "cursor.com"]);

const used = new Set<string>();

export type OauthDeps = {
  limit?: Limit;
  fetchCimd?: typeof fetch;
  now?: () => number;
};

function remember(jti: string): boolean {
  if (used.has(jti)) return false;
  used.add(jti);
  if (used.size > 5_000) {
    const first = used.values().next().value;
    if (first) used.delete(first);
  }
  return true;
}

export function resetOauthMemory(): void {
  used.clear();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function acceptableRedirect(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password || url.hash) return false;
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
}

function sameRedirect(candidate: string, allowed: string): boolean {
  let left: URL;
  let right: URL;
  try {
    left = new URL(candidate);
    right = new URL(allowed);
  } catch {
    return false;
  }
  const loopback = (host: string) => host === "localhost" || host === "127.0.0.1";
  if (loopback(left.hostname) && loopback(right.hostname) && left.protocol === right.protocol) {
    return left.pathname === right.pathname && left.search === right.search;
  }
  return left.protocol === right.protocol && left.host === right.host && left.pathname === right.pathname && left.search === right.search;
}

function redirectAllowed(candidate: string, allowed: string[]): boolean {
  if (!acceptableRedirect(candidate)) return false;
  return allowed.some((entry) => sameRedirect(candidate, entry));
}

function redirectTarget(redirectUri: string, params: Record<string, string>, issuer: string): string {
  const target = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value) target.searchParams.set(key, value);
  }
  target.searchParams.set("iss", issuer);
  return target.toString();
}

function sendRedirect(res: ServerResponse, location: string): void {
  applyCors(res);
  res.statusCode = 302;
  res.setHeader("location", location);
  res.setHeader("cache-control", "no-store");
  res.setHeader("referrer-policy", "no-referrer");
  res.end();
}

async function cimdRedirects(clientId: string, fetchCimd: typeof fetch): Promise<string[] | null> {
  let url: URL;
  try {
    url = new URL(clientId);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !CIMD_HOSTS.has(url.hostname) || (url.port && url.port !== "443")) return null;
  const response = await fetchCimd(url, { redirect: "error", signal: AbortSignal.timeout(3000) });
  if (!response.ok) return null;
  const text = await response.text();
  if (text.length > 16_384) return null;
  const document = JSON.parse(text) as { redirect_uris?: unknown };
  if (!Array.isArray(document.redirect_uris)) return null;
  return document.redirect_uris.filter((item): item is string => typeof item === "string");
}

async function clientRedirects(clientId: string, fetchCimd: typeof fetch): Promise<string[] | null> {
  const secret = signingSecret();
  if (!secret || !clientId || clientId.length > 4096) return null;
  if (clientId.startsWith("tr1.")) {
    const payload = readToken(clientId, secret);
    if (!payload || payload.kind !== "client" || !payload.redirectUris?.length) return null;
    return payload.redirectUris;
  }
  if (clientId.startsWith("https://")) return cimdRedirects(clientId, fetchCimd);
  return null;
}

function grantedScope(requested: string | null): string | null {
  if (!requested) return `${READ_SCOPE} ${OFFLINE_SCOPE}`;
  const parts = requested.split(/\s+/).filter(Boolean);
  if (!parts.includes(READ_SCOPE)) return null;
  if (!scopeAllowed(parts.join(" "))) return null;
  return parts.join(" ");
}

function page(res: ServerResponse, status: number, title: string, body: string): void {
  applyCors(res);
  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex");
  res.setHeader("referrer-policy", "no-referrer");
  res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font:16px/1.4 system-ui,sans-serif;margin:2rem auto;max-width:36rem;padding:0 1rem}label{display:block;margin:1rem 0 .25rem}input{width:100%;box-sizing:border-box}button{margin-top:1rem}</style>
</head><body><h1>${escapeHtml(title)}</h1>${body}</body></html>`);
}

function hidden(name: string, value: string): string {
  return `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`;
}

export function protectedResourceMetadata(origin: string) {
  return {
    resource: mcpResource(origin),
    authorization_servers: [origin],
    scopes_supported: [READ_SCOPE],
    bearer_methods_supported: ["header"],
    resource_documentation: `${origin}/`,
  };
}

export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/api/oauth/authorize`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [READ_SCOPE, OFFLINE_SCOPE],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
  };
}

export async function handleProtectedResource(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendError(res, "method_not_allowed", "GET only.");
    return;
  }
  sendJson(res, 200, protectedResourceMetadata(requestOrigin(req)));
}

export async function handleAuthorizationServer(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendError(res, "method_not_allowed", "GET only.");
    return;
  }
  sendJson(res, 200, authorizationServerMetadata(requestOrigin(req)));
}

export async function handleRegister(req: IncomingMessage, res: ServerResponse, deps: OauthDeps = {}): Promise<void> {
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!(deps.limit ?? sharedLimit).allow(clientAddress(req))) {
    sendError(res, "rate_limited", "Too many requests.");
    return;
  }
  if (req.method !== "POST") {
    sendError(res, "method_not_allowed", "POST only.");
    return;
  }
  const secret = signingSecret();
  if (!secret) {
    sendError(res, "read_token_unconfigured", "TRIGGER_READ_TOKEN is not set on this server.");
    return;
  }
  if (mediaType(req) !== "application/json") {
    sendError(res, "unsupported_media", "Dynamic registration expects application/json.");
    return;
  }
  const raw = await readRaw(req);
  if (!raw.ok) {
    sendError(res, "payload_too_large", "Request body is too large.");
    return;
  }
  let body: { redirect_uris?: unknown; token_endpoint_auth_method?: unknown };
  try {
    body = JSON.parse(raw.raw) as typeof body;
  } catch {
    sendError(res, "bad_request", "Registration body is not JSON.");
    return;
  }
  const method = body.token_endpoint_auth_method;
  if (method != null && method !== "none") {
    sendJson(res, 400, { error: "invalid_client_metadata", error_description: "Only public clients (token_endpoint_auth_method none) are accepted." });
    return;
  }
  const redirects = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((item): item is string => typeof item === "string") : [];
  if (!redirects.length || redirects.length > 5 || redirects.some((item) => !acceptableRedirect(item))) {
    sendJson(res, 400, { error: "invalid_redirect_uri", error_description: "redirect_uris must be https, or loopback http." });
    return;
  }
  const clientId = signToken({ v: 1, kind: "client", redirectUris: redirects, iat: Math.floor(Date.now() / 1000) }, secret);
  sendJson(res, 201, {
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0,
    redirect_uris: redirects,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    scope: `${READ_SCOPE} ${OFFLINE_SCOPE}`,
  });
}

function clientAddress(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

type AuthQuery = {
  responseType: string;
  clientId: string;
  redirectUri: string;
  challenge: string;
  method: string;
  state: string;
  scope: string;
  resource: string;
};

function authQuery(params: URLSearchParams): AuthQuery {
  return {
    responseType: params.get("response_type") ?? "",
    clientId: params.get("client_id") ?? "",
    redirectUri: params.get("redirect_uri") ?? "",
    challenge: params.get("code_challenge") ?? "",
    method: params.get("code_challenge_method") ?? "",
    state: params.get("state") ?? "",
    scope: params.get("scope") ?? "",
    resource: params.get("resource") ?? "",
  };
}

export async function handleAuthorize(req: IncomingMessage, res: ServerResponse, deps: OauthDeps = {}): Promise<void> {
  const origin = requestOrigin(req);
  const resource = mcpResource(origin);
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!(deps.limit ?? sharedLimit).allow(clientAddress(req))) {
    sendError(res, "rate_limited", "Too many requests.");
    return;
  }
  const url = new URL(req.url ?? "/", origin);
  let params = url.searchParams;
  let readTokenField = "";
  if (req.method === "POST") {
    if (mediaType(req) !== "application/x-www-form-urlencoded") {
      sendError(res, "unsupported_media", "The authorize form expects application/x-www-form-urlencoded.");
      return;
    }
    const raw = await readRaw(req);
    if (!raw.ok) {
      sendError(res, "payload_too_large", "Request body is too large.");
      return;
    }
    const form = new URLSearchParams(raw.raw);
    readTokenField = form.get("read_token") ?? "";
    params = form;
  } else if (req.method !== "GET") {
    sendError(res, "method_not_allowed", "GET or POST only.");
    return;
  }
  const query = authQuery(params);
  const secret = signingSecret();
  if (!secret || !configuredReadToken()) {
    page(res, 503, "Trigger read", "<p>TRIGGER_READ_TOKEN is not set on this server.</p>");
    return;
  }
  if (query.responseType !== "code" || !query.clientId || !query.redirectUri || !query.challenge || query.method !== "S256") {
    page(res, 400, "Trigger read", "<p>The authorization request is missing the code flow or S256 PKCE.</p>");
    return;
  }
  if (query.state.length > 512 || query.scope.length > 256) {
    page(res, 400, "Trigger read", "<p>The authorization request is too large.</p>");
    return;
  }
  if (query.resource && query.resource !== resource) {
    page(res, 400, "Trigger read", "<p>The resource does not match this MCP server.</p>");
    return;
  }
  let redirects: string[] | null = null;
  try {
    redirects = await clientRedirects(query.clientId, deps.fetchCimd ?? fetch);
  } catch {
    redirects = null;
  }
  if (!redirects || !redirectAllowed(query.redirectUri, redirects)) {
    page(res, 400, "Trigger read", "<p>The client or redirect URI is not registered for this server.</p>");
    return;
  }
  const scope = grantedScope(query.scope || null);
  if (!scope) {
    sendRedirect(res, redirectTarget(query.redirectUri, { error: "invalid_scope", error_description: "Only trigger:read is granted.", state: query.state }, origin));
    return;
  }
  if (req.method === "GET") {
    const host = new URL(query.redirectUri).host;
    page(
      res,
      200,
      "Allow Trigger read",
      `<p>This grants read-only Tower access to the client that will return to <strong>${escapeHtml(host)}</strong>.</p>
<p>Paste the Trigger read token only if you meant to connect that client. This does not dispatch work or change Tower.</p>
<form method="post" action="/api/oauth/authorize">
${hidden("response_type", query.responseType)}
${hidden("client_id", query.clientId)}
${hidden("redirect_uri", query.redirectUri)}
${hidden("code_challenge", query.challenge)}
${hidden("code_challenge_method", query.method)}
${hidden("state", query.state)}
${hidden("scope", query.scope)}
${hidden("resource", query.resource || resource)}
<label for="read_token">Read token</label>
<input id="read_token" name="read_token" type="password" autocomplete="off" required>
<button type="submit">Allow read</button>
</form>`,
    );
    return;
  }
  if (!tokensMatch(readTokenField, configuredReadToken() ?? "")) {
    page(res, 401, "Allow Trigger read", "<p>The read token did not match.</p>");
    return;
  }
  const times = freshExpiry(CODE_TTL, deps.now?.() ?? Date.now());
  const code = signToken(
    {
      v: 1,
      kind: "code",
      jti: newJti(),
      scope,
      aud: resource,
      clientId: query.clientId,
      redirectUri: query.redirectUri,
      challenge: query.challenge,
      ...times,
    },
    secret,
  );
  sendRedirect(res, redirectTarget(query.redirectUri, { code, state: query.state }, origin));
}

function pkce(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function issuePair(payload: { scope: string; aud: string; clientId: string }, secret: string, now: number) {
  const accessTimes = freshExpiry(ACCESS_TTL, now);
  const refreshTimes = freshExpiry(REFRESH_TTL, now);
  const access = signToken({ v: 1, kind: "access", jti: newJti(), scope: payload.scope, aud: payload.aud, clientId: payload.clientId, ...accessTimes }, secret);
  const refreshScope = payload.scope.includes(OFFLINE_SCOPE) ? payload.scope : `${payload.scope} ${OFFLINE_SCOPE}`;
  const refresh = signToken(
    { v: 1, kind: "refresh", jti: newJti(), scope: refreshScope, aud: payload.aud, clientId: payload.clientId, ...refreshTimes },
    secret,
  );
  return {
    access_token: access,
    token_type: "Bearer" as const,
    expires_in: ACCESS_TTL,
    refresh_token: refresh,
    scope: payload.scope,
  };
}

export async function handleToken(req: IncomingMessage, res: ServerResponse, deps: OauthDeps = {}): Promise<void> {
  const origin = requestOrigin(req);
  const resource = mcpResource(origin);
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!(deps.limit ?? sharedLimit).allow(clientAddress(req))) {
    sendError(res, "rate_limited", "Too many requests.");
    return;
  }
  if (req.method !== "POST") {
    sendError(res, "method_not_allowed", "POST only.");
    return;
  }
  const secret = signingSecret();
  if (!secret) {
    sendJson(res, 503, { error: "server_error", error_description: "TRIGGER_READ_TOKEN is not set on this server." });
    return;
  }
  if (mediaType(req) !== "application/x-www-form-urlencoded") {
    sendError(res, "unsupported_media", "The token endpoint expects application/x-www-form-urlencoded.");
    return;
  }
  const raw = await readRaw(req);
  if (!raw.ok) {
    sendError(res, "payload_too_large", "Request body is too large.");
    return;
  }
  const form = new URLSearchParams(raw.raw);
  const grant = form.get("grant_type") ?? "";
  const clientId = form.get("client_id") ?? "";
  const resourceParam = form.get("resource") ?? "";
  if (resourceParam && resourceParam !== resource) {
    sendJson(res, 400, { error: "invalid_target", error_description: "resource does not match this MCP server." });
    return;
  }
  const now = deps.now?.() ?? Date.now();
  if (grant === "authorization_code") {
    const code = form.get("code") ?? "";
    const verifier = form.get("code_verifier") ?? "";
    const redirectUri = form.get("redirect_uri") ?? "";
    const payload = readToken(code, secret);
    if (!payload || payload.kind !== "code" || !payload.exp || payload.exp * 1000 < now || !payload.jti) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Authorization code rejected." });
      return;
    }
    if (payload.clientId !== clientId || payload.redirectUri !== redirectUri || payload.aud !== resource) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Authorization code rejected." });
      return;
    }
    if (!verifier || pkce(verifier) !== payload.challenge) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "PKCE verification failed." });
      return;
    }
    if (!remember(payload.jti)) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Authorization code already used." });
      return;
    }
    sendJson(res, 200, issuePair({ scope: payload.scope ?? READ_SCOPE, aud: resource, clientId }, secret, now));
    return;
  }
  if (grant === "refresh_token") {
    const refresh = form.get("refresh_token") ?? "";
    const payload = readToken(refresh, secret);
    if (!payload || payload.kind !== "refresh" || !payload.exp || payload.exp * 1000 < now || !payload.jti) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Refresh token rejected." });
      return;
    }
    if (payload.clientId !== clientId || payload.aud !== resource || !scopeAllowed(payload.scope)) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Refresh token rejected." });
      return;
    }
    if (!remember(`refresh:${payload.jti}`)) {
      sendJson(res, 400, { error: "invalid_grant", error_description: "Refresh token already used." });
      return;
    }
    sendJson(res, 200, issuePair({ scope: payload.scope ?? `${READ_SCOPE} ${OFFLINE_SCOPE}`, aud: resource, clientId }, secret, now));
    return;
  }
  sendJson(res, 400, { error: "unsupported_grant_type", error_description: "Use authorization_code or refresh_token." });
}

export function s256(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function testVerifier(): string {
  return randomBytes(32).toString("base64url");
}
