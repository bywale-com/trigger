// Walk a fixture that has packet plates. DESK_URL must already be that tree.
import puppeteer from "puppeteer-core";

const base = process.env.DESK_URL ?? "http://127.0.0.1:5187";

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});

const failures = [];
function check(name, ok, detail = "") {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
  console.log(`${ok ? "ok" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function clickText(page, value) {
  await page.waitForFunction((text) => {
    const nodes = [...document.querySelectorAll("button, a, td, span, div, label, h1, h2, h4")];
    return nodes.some((item) => item.textContent === text || item.textContent?.trim() === text);
  }, {}, value);
  const clicked = await page.evaluate((text) => {
    const nodes = [...document.querySelectorAll("button, a, td, span, div, label, h1, h2, h4")];
    const matches = nodes.filter((item) => item.textContent === text || item.textContent?.trim() === text);
    const node = matches.find((item) => !matches.some((other) => other !== item && item.contains(other)));
    if (!node) return false;
    node.click();
    return true;
  }, value);
  if (!clicked) throw new Error(`missing text: ${value}`);
}

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.waitForSelector("[data-testid=desk-header]");
  const header = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
  check("header fixture", header.includes("Trigger") && header.includes("9c45f19"), header);
  const buttons = await page.$$eval("button", (nodes) => nodes.map((node) => node.innerText.trim()));
  check(
    "no factory controls",
    !buttons.some((label) => ["Run", "Stop", "Authorize", "Dispatch", "Approve", "Reject"].includes(label)),
    buttons.join("|"),
  );

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=plates]");
  const packet = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("intended first", packet.indexOf("Intended behavior") < packet.indexOf("Plates"));
  check("plates before verification", packet.indexOf("Plates") < packet.indexOf("Verification"));
  check("copy", packet.includes("the header stays Trigger"));
  check("do not build", packet.includes("a switcher"));
  check("implied", packet.includes("dark mode still works"));
  check("completes", packet.includes("the packet page shows the plate"));
  check("out of scope", packet.includes("approval workflow"));
  check("no approval control", !packet.includes("Approve") && !packet.includes("Reject"));
  const images = await page.$$eval("[data-testid=plate-image] img", (nodes) =>
    nodes.map((node) => ({ src: node.getAttribute("src"), alt: node.getAttribute("alt") })),
  );
  check("two images", images.length === 2, String(images.length));
  check(
    "raw urls",
    images.every((image) => image.src?.includes("raw.githubusercontent.com/bywale-com/omcoda_tower/")),
    images.map((image) => image.src).join(" | "),
  );
  const links = await page.$$eval("[data-testid=plate-image] a", (nodes) => nodes.map((node) => node.getAttribute("href")));
  check(
    "blob artifacts",
    links.length === 2 && links.every((href) => href?.includes("github.com/bywale-com/omcoda_tower/blob/")),
    links.join(" | "),
  );
  await page.screenshot({ path: "/tmp/desk-plates-light.png" });

  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  const dark = await page.$eval("[data-testid=plates]", (node) => node.innerText);
  check("dark keeps buckets", dark.includes("the header stays Trigger") && dark.includes("a switcher"));
  await page.screenshot({ path: "/tmp/desk-plates-dark.png" });
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
