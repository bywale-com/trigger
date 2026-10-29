import { describe, expect, it } from "vitest";
import { createRefresh } from "./refresh.ts";
import { mergeRead, type Snapshot, type SnapshotBody } from "./snapshot.ts";

const snapshot = { sha: "abc", pages: [{ id: "exec-identity" }] } as unknown as Snapshot;

describe("refresh", () => {
  it("keeps the last snapshot when the next read throws", async () => {
    let calls = 0;
    const current = createRefresh(async () => {
      calls += 1;
      if (calls > 1) throw new Error("read failed");
      return snapshot;
    });
    expect(await current()).toEqual({ readFailed: false, snapshot });
    const failed = await current();
    expect(failed.readFailed).toBe(true);
    expect(failed.snapshot).toBe(snapshot);
  });

  it("returns no pages when the first read throws", async () => {
    const current = createRefresh(async () => {
      throw new Error("read failed");
    });
    expect(await current()).toEqual({ readFailed: true, snapshot: null });
  });

  it("keeps the client snapshot when the response drops", () => {
    const previous: SnapshotBody = { readFailed: false, snapshot };
    expect(mergeRead(previous, null, true)).toEqual({ readFailed: true, snapshot });
    expect(mergeRead(previous, { readFailed: true, snapshot: null }, false)).toEqual({
      readFailed: true,
      snapshot,
    });
  });
});
