import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { inlineText, parseFactoryMarkdown, stripLeadingTitle } from "./markdown.ts";

const fixture = join(fileURLToPath(new URL("../observe/tower/testdata/9c45f19", import.meta.url)));

describe("factory markdown", () => {
  it("drops a leading file title", () => {
    expect(stripLeadingTitle("# exec-identity specification\n\nBody.\n")).toBe("Body.");
  });

  it("turns the specification claims into a list", () => {
    const text = readFileSync(join(fixture, "docs/factory/initiatives/exec-identity/SPECIFICATION.md"), "utf8");
    const blocks = parseFactoryMarkdown(text, { stripTitle: true });
    expect(blocks[0]?.type).toBe("paragraph");
    const list = blocks.find((block) => block.type === "list");
    if (!list || list.type !== "list") throw new Error("list");
    expect(list.ordered).toBe(false);
    expect(list.items.map(inlineText).join(" ")).toContain("Claim 2");
    expect(list.items).toHaveLength(3);
    expect(inlineText(blocks.flatMap((block) => ("children" in block ? block.children : [])))).not.toContain("# exec-identity");
  });

  it("renders journal emphasis and inline code, not asterisks", () => {
    const text = readFileSync(join(fixture, "docs/factory/initiatives/exec-identity/journal/001.md"), "utf8");
    const blocks = parseFactoryMarkdown(text);
    expect(blocks[0]).toMatchObject({ type: "heading" });
    if (blocks[0]?.type !== "heading") throw new Error("heading");
    expect(inlineText(blocks[0].children)).toContain("Factory index");
    const strong = JSON.stringify(blocks);
    expect(strong).toContain('"type":"strong"');
    expect(strong).toContain('"type":"code"');
    expect(strong).not.toContain("**When:**");
  });

  it("keeps script tags as text", () => {
    const blocks = parseFactoryMarkdown("Hello <script>alert(1)</script>.");
    expect(JSON.stringify(blocks)).toContain("<script>alert(1)</script>");
    expect(JSON.stringify(blocks)).not.toContain('"type":"html"');
  });

  it("drops javascript links", () => {
    const blocks = parseFactoryMarkdown("See [x](javascript:alert(1)) here.");
    expect(JSON.stringify(blocks)).not.toContain("javascript:");
  });
});
