import { describe, expect, it } from "vitest";
import { configuredTowerRef, resolveTowerRef } from "./read.ts";

describe("factory branch", () => {
  it("reads the configured branch and lets TOWER_REF replace it", () => {
    const configured = configuredTowerRef();
    expect(configured).toBe("cursor/factory-agents-scope-33ee");
    expect(configured).not.toMatch(/^[0-9a-f]{7,40}$/);
    expect(resolveTowerRef({ TOWER_REF: "main" })).toBe("main");
    expect(resolveTowerRef({ TOWER_REF: "  " })).toBe(configured);
    expect(resolveTowerRef({})).toBe(configured);
  });
});
