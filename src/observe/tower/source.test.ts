import { describe, expect, it } from "vitest";
import { configuredTowerRef, githubRepo, resolveTowerRef, towerReadMode } from "./read.ts";

describe("factory branch", () => {
  it("reads the configured branch and lets TOWER_REF replace it", () => {
    const configured = configuredTowerRef();
    expect(configured).toBe("cursor/factory-agents-scope-33ee");
    expect(configured).not.toMatch(/^[0-9a-f]{7,40}$/);
    expect(resolveTowerRef({ TOWER_REF: "main" })).toBe("main");
    expect(resolveTowerRef({ TOWER_REF: "  " })).toBe(configured);
    expect(resolveTowerRef({})).toBe(configured);
  });

  it("uses GitHub on Vercel and git locally", () => {
    expect(githubRepo("https://github.com/bywale-com/omcoda_tower.git")).toBe("bywale-com/omcoda_tower");
    expect(towerReadMode({ VERCEL: "1" })).toBe("github");
    expect(towerReadMode({ TOWER_READ: "github" })).toBe("github");
    expect(towerReadMode({ TOWER_FIXTURE: "/tmp/fixture", VERCEL: "1" })).toBe("fixture");
    expect(towerReadMode({})).toBe("git");
  });
});
