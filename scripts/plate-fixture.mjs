// Materialize a 9c45f19 copy with two packet plates and a filled ## Plates body.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2];
if (!root) {
  console.error("usage: node scripts/plate-fixture.mjs <dir>");
  process.exit(1);
}

const fixture = join(dirname(fileURLToPath(import.meta.url)), "../src/observe/tower/testdata/9c45f19");
cpSync(fixture, root, { recursive: true });
const notePath = join(root, "docs/factory/initiatives/exec-identity/packets/PKT-001-click-attribution.md");
const plates = `## Plates

**Copy:** the header stays Trigger
**Do not build:** a switcher
**Implied:** dark mode still works
**Completes:** the packet page shows the plate
**Out of scope:** approval workflow

![light](../plates/pkt-001-click-attribution-light.png)
![dark](../plates/pkt-001-click-attribution-dark.png)
`;
writeFileSync(notePath, `${readFileSync(notePath, "utf8").trimEnd()}\n\n${plates}\n`);
const dir = join(root, "docs/factory/initiatives/exec-identity/plates");
mkdirSync(dir, { recursive: true });
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
writeFileSync(join(dir, "pkt-001-click-attribution-light.png"), png);
writeFileSync(join(dir, "pkt-001-click-attribution-dark.png"), png);
console.log(root);
