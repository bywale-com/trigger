/**
 * Read authentication.
 *
 * Static bearer: TRIGGER_READ_TOKEN.
 * OAuth access tokens are HMAC-signed and carry scope trigger:read only.
 * Write scopes are not issued and are not accepted.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

export const READ_SCOPE = "trigger:read";
export const OFFLINE_SCOPE = "offline_access";
const ALLOWED_SCOPES = new Set([READ_SCOPE, OFFLINE_SCOPE]);
const SKEW_MS = 30_000;

export type TokenKind = "access" | "refresh" | "code" | "client";

export type TokenPayload = {
  v: 1;
  kind: TokenKind;
  scope?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  clientId?: string;
  redirectUri?: string;
  challenge?: string;
  redirectUris?: string[];
};

export type BearerOk = { ok: true; via: "static" | "oauth" };
export type BearerNo = { ok: false; code: "unauthorized" | "read_token_unconfigured"; message: string };

export function configuredReadToken(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = env.TRIGGER_READ_TOKEN?.trim() ?? "";
  return token || null;
}

export function signingSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const dedicated = env.TRIGGER_OAUTH_SECRET?.trim() ?? "";
  if (dedicated) return dedicated;
  return configuredReadToken(env);
}

export function tokensMatch(presented: string, expected: string): boolean {
  if (!presented || !expected) return false;
  const left = createHash("sha256").update(presented).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function scopeAllowed(scope: string | undefined, requireRead = true): boolean {
  const parts = (scope ?? "").split(/\s+/).filter(Boolean);
  if (requireRead && !parts.includes(READ_SCOPE)) return false;
  return parts.every((part) => ALLOWED_SCOPES.has(part));
}

export function newJti(): string {
  return randomBytes(16).toString("base64url");
}

export function signToken(payload: TokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `tr1.${body}.${sig}`;
}

export function readToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "tr1") return null;
  const body = parts[1] ?? "";
  const sig = parts[2] ?? "";
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (payload?.v !== 1 || !payload.kind) return null;
    return payload;
  } catch {
    return null;
  }
}

export function bearerFrom(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  const value = (Array.isArray(header) ? header[0] : header)?.trim() ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(value);
  return match?.[1] ?? null;
}

export function checkBearer(presented: string | null, resource: string, now = Date.now()): BearerOk | BearerNo {
  const expected = configuredReadToken();
  const secret = signingSecret();
  if (!expected || !secret) {
    return {
      ok: false,
      code: "read_token_unconfigured",
      message: "TRIGGER_READ_TOKEN is not set on this server.",
    };
  }
  if (!presented) {
    return { ok: false, code: "unauthorized", message: "Bearer token required." };
  }
  if (tokensMatch(presented, expected)) return { ok: true, via: "static" };
  const payload = readToken(presented, secret);
  if (!payload || payload.kind !== "access") {
    return { ok: false, code: "unauthorized", message: "Bearer token rejected." };
  }
  if (!payload.exp || payload.exp * 1000 < now - SKEW_MS) {
    return { ok: false, code: "unauthorized", message: "Bearer token rejected." };
  }
  if (!scopeAllowed(payload.scope)) {
    return { ok: false, code: "unauthorized", message: "Bearer token rejected." };
  }
  if (payload.aud !== resource) {
    return { ok: false, code: "unauthorized", message: "Bearer token rejected." };
  }
  return { ok: true, via: "oauth" };
}

export function freshExpiry(seconds: number, now = Date.now()): { iat: number; exp: number } {
  const iat = Math.floor(now / 1000);
  return { iat, exp: iat + seconds };
}
