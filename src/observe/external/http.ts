/** Shared HTTP for the external read. No write routes live here. */
import type { IncomingMessage, ServerResponse } from "node:http";
import { bearerFrom, checkBearer, type BearerNo } from "./auth.ts";

export const BODY_LIMIT = 32 * 1024;

export type ReadErrorCode =
  | "unauthorized"
  | "not_found"
  | "method_not_allowed"
  | "bad_request"
  | "payload_too_large"
  | "rate_limited"
  | "read_unavailable"
  | "read_token_unconfigured"
  | "unsupported_media"
  | "internal";

export type Limit = { allow(key: string): boolean };

export function memoryLimit(limit: number, windowMs = 60_000): Limit {
  const hits = new Map<string, number[]>();
  return {
    allow(key: string) {
      const now = Date.now();
      const start = now - windowMs;
      const list = (hits.get(key) ?? []).filter((at) => at > start);
      if (list.length >= limit) {
        hits.set(key, list);
        return false;
      }
      list.push(now);
      hits.set(key, list);
      return true;
    },
  };
}

export const sharedLimit = memoryLimit(60);

export function statusFor(code: ReadErrorCode): number {
  switch (code) {
    case "unauthorized":
      return 401;
    case "not_found":
      return 404;
    case "method_not_allowed":
      return 405;
    case "bad_request":
      return 400;
    case "payload_too_large":
      return 413;
    case "rate_limited":
      return 429;
    case "unsupported_media":
      return 415;
    case "read_unavailable":
    case "read_token_unconfigured":
      return 503;
    case "internal":
      return 500;
  }
}

export function headerValue(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",")[0]?.trim() ?? "";
}

export function requestOrigin(req: IncomingMessage): string {
  const host = headerValue(req, "x-forwarded-host") || headerValue(req, "host") || "localhost";
  const forwarded = headerValue(req, "x-forwarded-proto");
  const local = host.startsWith("127.0.0.1") || host.startsWith("localhost") || host.startsWith("[::1]");
  const scheme = forwarded || (local ? "http" : "https");
  return `${scheme}://${host}`;
}

export function mcpResource(origin: string): string {
  return `${origin}/api/mcp`;
}

export function clientKey(req: IncomingMessage): string {
  return headerValue(req, "x-forwarded-for") || req.socket?.remoteAddress || "unknown";
}

export function applyCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "authorization, content-type, mcp-protocol-version, mcp-session-id");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("access-control-expose-headers", "www-authenticate, mcp-protocol-version");
  res.setHeader("x-content-type-options", "nosniff");
}

export function sendJson(res: ServerResponse, status: number, body: unknown, extra?: Record<string, string>): void {
  if (res.headersSent) return;
  const payload = JSON.stringify(body);
  applyCors(res);
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  if (extra) {
    for (const [name, value] of Object.entries(extra)) res.setHeader(name, value);
  }
  res.statusCode = status;
  res.end(payload);
}

export function wwwAuthenticate(origin: string): string {
  const metadata = `${origin}/.well-known/oauth-protected-resource`;
  return `Bearer realm="trigger", resource_metadata="${metadata}", scope="trigger:read"`;
}

export function sendError(res: ServerResponse, code: ReadErrorCode, message: string, origin?: string): void {
  const extra: Record<string, string> = {};
  if (code === "unauthorized" && origin) extra["www-authenticate"] = wwwAuthenticate(origin);
  if (code === "rate_limited") extra["retry-after"] = "60";
  sendJson(res, statusFor(code), { error: { code, message } }, extra);
}

export function rejectBearer(res: ServerResponse, failure: BearerNo, origin: string): void {
  sendError(res, failure.code, failure.message, origin);
}

export function mediaType(req: IncomingMessage): string {
  return headerValue(req, "content-type").split(";")[0]?.trim().toLowerCase() ?? "";
}

export async function readRaw(req: IncomingMessage, limit = BODY_LIMIT): Promise<{ ok: true; raw: string } | { ok: false; code: "payload_too_large" }> {
  const prepared = preparedBody(req);
  if (prepared != null) {
    if (Buffer.byteLength(prepared) > limit) return { ok: false, code: "payload_too_large" };
    return { ok: true, raw: prepared };
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) {
      req.resume();
      return { ok: false, code: "payload_too_large" };
    }
    chunks.push(buf);
  }
  return { ok: true, raw: Buffer.concat(chunks).toString("utf8") };
}

function preparedBody(req: IncomingMessage): string | null {
  const body = (req as IncomingMessage & { body?: unknown }).body;
  if (typeof body === "string") return body.length ? body : null;
  if (Buffer.isBuffer(body)) return body.length ? body.toString("utf8") : null;
  if (!body || typeof body !== "object") return null;
  if (mediaType(req) === "application/json") return JSON.stringify(body);
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") flat[key] = value;
  }
  const encoded = new URLSearchParams(flat).toString();
  return encoded || null;
}

export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "error";
  return message.replace(/bearer\s+\S+/gi, "bearer [redacted]").slice(0, 300);
}

export function requireRead(req: IncomingMessage, res: ServerResponse, origin: string): boolean {
  const result = checkBearer(bearerFrom(req), mcpResource(origin));
  if (!result.ok) {
    rejectBearer(res, result, origin);
    return false;
  }
  return true;
}

export function logExternal(method: string, path: string, status: number): void {
  console.log(`external ${method} ${path} ${status}`);
}
