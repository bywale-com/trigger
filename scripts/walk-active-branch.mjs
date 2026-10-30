// Walk the desk pointed at the configured factory branch. DESK_URL defaults to the live server.
import puppeteer from "puppeteer-core";

const base = process.env.DESK_URL ?? "http://127.0.0.1:5175";
const ref = process.env.EXPECT_REF ?? "cursor/factory-agents-scope-33ee";
const sha = process.env.EXPECT_SHA ?? "";
const revision = process.env.EXPECT_REVISION ?? "";

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
  await page.waitForFunction(
    (text) => {
      const nodes = [...document.querySelectorAll("button, a, td, span, div, label, h1, h2, h4")];
      return nodes.some((item) => item.textContent === text || item.textContent?.trim() === text);
    },
    {},
    value,
  );
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
  check("branch", header.includes(ref), header.replaceAll("\n", " | "));
  if (sha) check("sha", header.includes(sha.slice(0, 7)), header);
  if (revision) check("revision", header.includes(`Ledger revision ${revision}`), header);
  check("scope active", header.includes("scope active"), header);

  const table = await page.evaluate(() => document.body.innerText);
  check("exec-identity", table.includes("Which execution a result belongs to"));
  check("integrated evidence", table.includes("1 verified · 1 integrated"));
  check("accepted packet", table.includes("An email click advances") && table.includes("2 checks · SHA"));
  check("released packets", table.includes("Opening an ask") && table.includes("A resumed wait") && table.includes("firing") && table.includes("audit result"));
  check("blocked launch", table.includes("Launch Agent") && table.includes("Blocked reason"));
  check("page count", /\d+ pages/.test(table), table.match(/\d+ pages/)?.[0]);
  check("factory pr", /PR \d+/.test(header), header.replaceAll("\n", " | "));
  const buttons = await page.$$eval("button", (nodes) => nodes.map((node) => node.innerText.trim()));
  check("no factory controls", !buttons.some((label) => ["Run", "Stop", "Authorize", "Dispatch"].includes(label)));
  await page.screenshot({ path: "/tmp/desk-active-table-light.png" });

  await clickText(page, "Which execution a result belongs to");
  await page.waitForSelector("[data-testid=detail]");
  const initiative = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("initiative queue", initiative.includes("active"));
  check("contained packets", initiative.includes("pkt-005-audit-row-grain"));
  await clickText(page, "← Tower");

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForFunction(() => document.body.innerText.includes("Integrated SHA"));
  const packet = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("integrated sha shown", packet.includes("9c45f19fa1ac9d909247d6be83c9263273b1bcbb"));
  check("checks remain", packet.includes("factory-check · pass · 40873984441"));
  check("accepted lifecycle", packet.includes("Accepted yes") && packet.includes("Integrated yes"));
  check("no completed collapse", !packet.includes("Completed yes"));
  await page.screenshot({ path: "/tmp/desk-active-packet-light.png" });
  await clickText(page, "← Tower");

  await clickText(page, "pkt-002-open-ask-cursor");
  await page.waitForSelector("[data-testid=lifecycle]");
  const candidate = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("candidate dispatched", candidate.includes("Dispatched yes"));
  check("candidate committed", candidate.includes("Committed yes"));
  check("candidate not verified as merge", candidate.includes("Verified no") || candidate.includes("Verified yes"));
  check("github section", candidate.includes("GitHub"));
  check("no invented packet branch", !candidate.includes("cursor/pkt-002"));
  check("no plates heading when none", !candidate.split("\n").includes("Plates"));
  check("no plate approval", !candidate.includes("Approve") && !candidate.includes("Reject"));
  await page.screenshot({ path: "/tmp/desk-candidate-light.png" });
  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  await page.screenshot({ path: "/tmp/desk-candidate-dark.png" });
  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Light"));
  await clickText(page, "← Tower");

  await clickText(page, "Launch Agent");
  await page.waitForFunction(() => document.body.innerText.includes("Factory production path is not the Launch Agent build."));
  await clickText(page, "← Tower");

  await clickText(page, "Graph");
  await page.waitForSelector("[data-testid=graph]");
  const nodes = await page.$$eval("[data-testid^=node-]", (list) => list.map((node) => node.getAttribute("data-testid")));
  const contains = await page.$$("[data-testid=contains-edge]");
  const depends = await page.$$("[data-testid=depends-edge]");
  check("graph nodes", nodes.length >= 7, String(nodes.length));
  check("contains edges", contains.length >= 5, String(contains.length));
  check("depends edge", depends.length === 1, String(depends.length));

  await clickText(page, "Filter");
  await clickText(page, "Add");
  await page.waitForFunction(() => document.body.innerText.includes("Type is Initiative"));
  const filtered = await page.$$eval("[data-testid^=node-]", (list) => list.length);
  const containsAfter = await page.$$("[data-testid=contains-edge]");
  const dependsAfter = await page.$$("[data-testid=depends-edge]");
  check("filtered initiatives", filtered === 2, String(filtered));
  check("filtered edges", containsAfter.length === 0 && dependsAfter.length === 1);

  const lightBg = await page.$eval(".ant-layout-header", (node) => getComputedStyle(node).backgroundColor);
  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  const darkBg = await page.$eval(".ant-layout-header", (node) => getComputedStyle(node).backgroundColor);
  check("dark differs", lightBg !== darkBg, `${lightBg} -> ${darkBg}`);
  await page.screenshot({ path: "/tmp/desk-active-graph-dark.png" });
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
