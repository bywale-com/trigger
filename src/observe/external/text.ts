/** Bounds strings the external read returns. The snapshot itself is unchanged. */

const TEXT_LIMIT = 6_000;
export const RESPONSE_LIMIT = 24_000;

export function clip(value: string | null | undefined, limit = TEXT_LIMIT): { text: string | null; truncated: boolean } {
  if (value == null) return { text: null, truncated: false };
  if (value.length <= limit) return { text: value, truncated: false };
  return { text: value.slice(0, limit), truncated: true };
}

function shrink(value: unknown, limit: number): unknown {
  if (typeof value === "string") return value.length <= limit ? value : value.slice(0, limit);
  if (Array.isArray(value)) return value.map((item) => shrink(item, limit));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) next[key] = shrink(item, limit);
    return next;
  }
  return value;
}

/** Last resort when field clips are not enough. Marks the body truncated. */
export function boundPayload<T>(value: T, limit = RESPONSE_LIMIT): T {
  const json = JSON.stringify(value);
  if (json.length <= limit) return value;
  const shrunk = shrink(value, 400);
  if (shrunk && typeof shrunk === "object" && !Array.isArray(shrunk)) {
    return { ...shrunk, truncated: true } as T;
  }
  return { truncated: true } as T;
}
