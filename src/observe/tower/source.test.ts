import { describe, expect, it } from "vitest";
import {
  configuredTowerRef,
  githubRepo,
  packetIdForms,
  plateFilenameMatches,
  resolvePlateHref,
  pinnedTowerRef,
  resolveTowerRef,
  shaFromUploadPack,
  towerReadMode,
  usableGithubToken,
} from "./read.ts";

describe("factory branch", () => {
  it("reads the configured branch and lets TOWER_REF replace it", () => {
    const configured = configuredTowerRef();
    expect(configured).toBe("cursor/factory-agents-scope-33ee");
    expect(configured).not.toMatch(/^[0-9a-f]{7,40}$/);
    expect(resolveTowerRef({ TOWER_REF: "main" })).toBe("main");
    expect(resolveTowerRef({ TOWER_REF: "  " })).toBe(configured);
    expect(resolveTowerRef({})).toBe(configured);
    expect(pinnedTowerRef({ TOWER_REF: "main" })).toBe("main");
    expect(pinnedTowerRef({ TOWER_SOURCE: "configured" })).toBe(configured);
    expect(pinnedTowerRef({ VERCEL_ENV: "production", TOWER_REF: configured, TOWER_SOURCE: "configured" })).toBeNull();
    expect(pinnedTowerRef({ VERCEL_ENV: "preview", TOWER_REF: "main" })).toBe("main");
  });

  it("uses GitHub on Vercel and git locally", () => {
    expect(githubRepo("https://github.com/bywale-com/omcoda_tower.git")).toBe("bywale-com/omcoda_tower");
    expect(towerReadMode({ VERCEL: "1" })).toBe("github");
    expect(towerReadMode({ TOWER_READ: "git", VERCEL: "1" })).toBe("git");
    expect(towerReadMode({ TOWER_READ: "github" })).toBe("github");
    expect(towerReadMode({ TOWER_FIXTURE: "/tmp/fixture", VERCEL: "1" })).toBe("fixture");
    expect(towerReadMode({})).toBe("git");
    expect(usableGithubToken("${GH_TOKEN_BYWALE}")).toBeUndefined();
    expect(usableGithubToken("  ")).toBeUndefined();
    expect(usableGithubToken("ghp_exampletokenvalue")).toBe("ghp_exampletokenvalue");
    expect(packetIdForms("pkt-002-open-ask-cursor")).toEqual(["pkt-002-open-ask-cursor", "PKT-002-open-ask-cursor"]);
    expect(plateFilenameMatches("pkt-002-open-ask-cursor-light.png", "pkt-002-open-ask-cursor")).toBe(true);
    expect(plateFilenameMatches("pkt-001-click-attribution-light.png", "pkt-002-open-ask-cursor")).toBe(false);
    const noteDir = "docs/factory/initiatives/exec-identity/packets";
    expect(resolvePlateHref(noteDir, "../plates/pkt-002-open-ask-cursor-light.png", "bywale-com/omcoda_tower")).toBe(
      "docs/factory/initiatives/exec-identity/plates/pkt-002-open-ask-cursor-light.png",
    );
    expect(resolvePlateHref(noteDir, "../../../../etc/passwd", "bywale-com/omcoda_tower")).toBeNull();
    expect(resolvePlateHref(noteDir, "https://example.com/x.png", "bywale-com/omcoda_tower")).toBeNull();
    expect(
      resolvePlateHref(
        noteDir,
        "https://raw.githubusercontent.com/bywale-com/omcoda_tower/abc/docs/factory/initiatives/exec-identity/plates/x.png",
        "bywale-com/omcoda_tower",
      ),
    ).toBe("docs/factory/initiatives/exec-identity/plates/x.png");
    const pack =
      "001e# service=git-upload-pack\n0000" +
      "0059a891d452fb45c8f83ad92f5c661185a3f1f468d0 refs/heads/cursor/factory-agents-scope-33ee\n" +
      "003d0405ac12c4f2e02b51bee15a3db0e7db0b6ad027 refs/heads/main\n";
    expect(shaFromUploadPack(pack, "cursor/factory-agents-scope-33ee")).toBe(
      "a891d452fb45c8f83ad92f5c661185a3f1f468d0",
    );
  });
});
