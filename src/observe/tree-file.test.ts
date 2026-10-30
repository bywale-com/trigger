import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeTreeImagePath, setTreeFileRoot, treeFileResult, treeFileUrl } from "./tree-file.ts";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("tree-file", () => {
  it("only serves factory images from the on-disk tree", async () => {
    const root = mkdtempSync(join(tmpdir(), "trigger-tree-file-"));
    const dir = join(root, "docs/factory/initiatives/exec-identity/plates");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "pkt-001-click-attribution-light.png"), png);
    setTreeFileRoot(root);
    expect(sanitizeTreeImagePath("../etc/passwd")).toBeNull();
    expect(sanitizeTreeImagePath("docs/register/agents-blueprint/C0.png")).toBeNull();
    expect(sanitizeTreeImagePath("docs/factory/initiatives/exec-identity/SPECIFICATION.md")).toBeNull();
    const ok = await treeFileResult("docs/factory/initiatives/exec-identity/plates/pkt-001-click-attribution-light.png");
    expect(ok.status).toBe(200);
    expect(ok.contentType).toBe("image/png");
    expect(Buffer.isBuffer(ok.body) && (ok.body as Buffer).equals(png)).toBe(true);
    setTreeFileRoot(null);
    const missing = await treeFileResult("docs/factory/initiatives/exec-identity/plates/pkt-001-click-attribution-light.png");
    expect(missing.status).toBe(404);
    expect(treeFileUrl("docs/factory/x.png")).toBe("/api/tree-file?path=docs%2Ffactory%2Fx.png");
  });
});
