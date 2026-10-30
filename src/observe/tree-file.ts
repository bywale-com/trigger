import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { posix } from "node:path";

const IMAGE_EXT = /\.(png|webp|jpe?g|gif)$/i;

const types: Record<string, string> = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

let servingRoot: string | null = null;

export function setTreeFileRoot(root: string | null): void {
  servingRoot = root;
}

export function treeFileUrl(path: string): string {
  return `/api/tree-file?path=${encodeURIComponent(path)}`;
}

export function sanitizeTreeImagePath(path: string | null): string | null {
  if (!path) return null;
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return null;
  }
  const normalized = posix.normalize(decoded.replace(/^\/+/, ""));
  if (!normalized.startsWith("docs/factory/") || normalized.includes("..")) return null;
  if (!IMAGE_EXT.test(normalized)) return null;
  return normalized;
}

export async function readTreeImage(path: string | null): Promise<{ bytes: Buffer; contentType: string } | null> {
  const safe = sanitizeTreeImagePath(path);
  if (!safe || !servingRoot) return null;
  try {
    const bytes = await readFile(join(servingRoot, safe));
    const ext = posix.extname(safe).toLowerCase();
    return { bytes, contentType: types[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export type TreeFileResult = {
  status: number;
  contentType: string;
  body: Buffer | string;
  cacheControl?: string;
};

export async function treeFileResult(path: string | null): Promise<TreeFileResult> {
  const image = await readTreeImage(path);
  if (!image) {
    return { status: 404, contentType: "text/plain; charset=utf-8", body: "not found" };
  }
  return {
    status: 200,
    contentType: image.contentType,
    body: image.bytes,
    cacheControl: "public, max-age=60",
  };
}
