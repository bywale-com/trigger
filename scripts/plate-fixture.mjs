// Materialize a 9c45f19 copy with two packet plates and a filled ## Plates body.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2];
if (!root) {
  console.error("usage: node scripts/plate-fixture.mjs <dir>");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "../src/observe/tower/testdata/9c45f19");
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
const fallback = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
for (const name of ["pkt-001-click-attribution-light.png", "pkt-001-click-attribution-dark.png"]) {
  const source = join(here, "plate-images", name);
  if (existsSync(source)) cpSync(source, join(dir, name));
  else writeFileSync(join(dir, name), fallback);
}
console.log(root);
