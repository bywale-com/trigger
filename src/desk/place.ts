import type { DeskFilter } from "../observe/snapshot.ts";

export type WalkablePage = {
  id: string;
  type: "Initiative" | "Packet";
  initiativeId?: string;
};

export const PAGE_GUTTER_DESKTOP = 24;
export const PAGE_GUTTER_COMPACT = 16;
export const MODE_KEY = "trigger-desk-mode";

export function pageFromHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function hashForPage(id: string | null): string {
  return id ? `#${encodeURIComponent(id)}` : "";
}

export function withFilter(filters: DeskFilter[], next: DeskFilter): DeskFilter[] {
  if (!next.value) return filters;
  return [...filters.filter((item) => item.field !== next.field), next];
}

export function neighbors<T extends WalkablePage>(pages: T[], page: T): { prev: T | null; next: T | null } {
  const group =
    page.type === "Packet"
      ? pages.filter((item) => item.type === "Packet" && item.initiativeId === page.initiativeId)
      : pages.filter((item) => item.type === "Initiative");
  const index = group.findIndex((item) => item.id === page.id);
  return {
    prev: index > 0 ? group[index - 1] ?? null : null,
    next: index >= 0 && index < group.length - 1 ? group[index + 1] ?? null : null,
  };
}

export function readMode(): "light" | "dark" {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* private mode */
  }
  return "light";
}

export function writeMode(mode: "light" | "dark") {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* private mode */
  }
}
