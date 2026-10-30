import { describe, expect, it } from "vitest";
import { hashForPage, neighbors, pageFromHash, withFilter } from "./place.ts";
import type { DeskFilter } from "../observe/snapshot.ts";

describe("place", () => {
  it("reads and writes the page hash", () => {
    expect(pageFromHash("")).toBeNull();
    expect(pageFromHash("#")).toBeNull();
    expect(pageFromHash("#pkt-001-click-attribution")).toBe("pkt-001-click-attribution");
    expect(hashForPage("pkt-001-click-attribution")).toBe("#pkt-001-click-attribution");
    expect(hashForPage(null)).toBe("");
  });

  it("replaces a filter on the same field", () => {
    const current: DeskFilter[] = [{ field: "Type", value: "Initiative" }];
    expect(withFilter(current, { field: "Stage", value: "Verified" })).toEqual([
      { field: "Type", value: "Initiative" },
      { field: "Stage", value: "Verified" },
    ]);
    expect(withFilter(current, { field: "Type", value: "Packet" })).toEqual([{ field: "Type", value: "Packet" }]);
  });

  it("walks packets inside the same initiative", () => {
    const pages = [
      { id: "exec-identity", type: "Initiative" as const },
      { id: "pkt-001-click-attribution", type: "Packet" as const, initiativeId: "exec-identity" },
      { id: "pkt-002-open-ask", type: "Packet" as const, initiativeId: "exec-identity" },
      { id: "launch-agent", type: "Initiative" as const },
    ];
    const first = neighbors(pages, pages[1]!);
    expect(first.prev).toBeNull();
    expect(first.next?.id).toBe("pkt-002-open-ask");
    const second = neighbors(pages, pages[2]!);
    expect(second.prev?.id).toBe("pkt-001-click-attribution");
    expect(second.next).toBeNull();
    const initiatives = neighbors(pages, pages[0]!);
    expect(initiatives.next?.id).toBe("launch-agent");
  });
});
