import { describe, expect, it } from "vitest";
import { COMPACT_QUERY } from "./compact.ts";

describe("compact shell", () => {
  it("kicks in below Ant lg and leaves 1440 on the desktop table", () => {
    expect(COMPACT_QUERY).toBe("(max-width: 991px)");
  });
});
