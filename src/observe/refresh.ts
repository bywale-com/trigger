import { readTower } from "./tower/read.ts";
import type { Snapshot, SnapshotBody } from "./snapshot.ts";

export type { SnapshotBody };

export function createRefresh(read: () => Promise<Snapshot>) {
  let last: Snapshot | null = null;
  return async function current(): Promise<SnapshotBody> {
    try {
      const snapshot = await read();
      last = snapshot;
      return { readFailed: false, snapshot };
    } catch (error) {
      const message = error instanceof Error ? error.message : "read failed";
      console.error(`tower read failed: ${message}`);
      return { readFailed: true, snapshot: last };
    }
  };
}

export const currentSnapshot = createRefresh(readTower);
