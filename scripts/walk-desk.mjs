// Walk the planted desk against the 9c45f19 fixture. The header check expects that sha.
import { writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const base = process.env.DESK_URL ?? "http://127.0.0.1:5173";

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
  check("header source", header.includes("Trigger") && header.includes("Tower") && header.includes("9c45f19"), header);
  check("header ledger", header.includes("Ledger revision 1") && header.includes("scope inactive"), header);
  check("light", header.includes("Light"));

  const table = await page.evaluate(() => document.body.innerText);
  check("three names", table.includes("Which execution a result belongs to") && table.includes("An email click advances") && table.includes("Launch Agent"));
  check("no fourth representative", !table.includes("Session resume") && !table.includes("Stamp the pursuit"));
  check("evidence", table.includes("1 verified · not integrated") && table.includes("2 checks · no SHA") && table.includes("Blocked reason"));
  check("execution", table.includes("Idle · no dispatch") && table.includes("Manual · not live"));
  check("inside and depends", table.includes("exec-identity") && table.split("exec-identity").length > 2);
  check("page count", table.includes("3 pages"));
  const columns = await page.evaluate(() => {
    const headers = [...document.querySelectorAll(".ant-table-thead th")].map((node) => {
      const box = node.getBoundingClientRect();
      return { text: node.innerText.trim(), left: box.left, right: box.right };
    });
    const clipped = [...document.querySelectorAll(".ant-table-cell")]
      .filter((node) => node.scrollWidth > node.clientWidth + 2 || node.scrollHeight > node.clientHeight + 2)
      .map((node) => node.innerText.replace(/\s+/g, " ").trim().slice(0, 60));
    return { headers, clipped, width: window.innerWidth };
  });
  const updated = columns.headers.find((item) => item.text === "Updated");
  check(
    "updated column in view",
    Boolean(updated) && updated.left >= 0 && updated.right <= columns.width + 1,
    JSON.stringify(columns.headers),
  );
  check("cells wrap", columns.clipped.length === 0, columns.clipped.join(" | "));
  await page.screenshot({ path: "/tmp/desk-table-light.png" });
  const buttons = await page.$$eval("button", (nodes) => nodes.map((node) => node.innerText.trim()));
  check(
    "no factory controls",
    !buttons.some((label) => ["Run", "Stop", "Authorize", "Dispatch"].includes(label)),
    buttons.join("|"),
  );

  await clickText(page, "Which execution a result belongs to");
  await page.waitForSelector("[data-testid=detail]");
  const initiative = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("obligation", initiative.includes("Specify and, where a packet is released, implement the identity rules already locked on PR 135."));
  check("not manifest obligation", !initiative.includes("Do not complete neighboring modules."));
  check("claim 3", initiative.includes("a completion belongs to the pursuit that asked for it"));
  check("outstanding", initiative.includes("Claims 4, 6, 7, and 8 have no packets."));
  check("journal", initiative.includes("2026-10-29"));
  check("depended on by", initiative.includes("launch-agent"));
  check("no founder decisions on glass", !initiative.includes("Who is placed on launch day."));

  await clickText(page, "pkt-001-click-attribution");
  await page.waitForFunction(() => document.body.innerText.includes("Intended behavior"));
  const packet = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("intended", packet.includes("An email click advances the enrollment named on the outbound message."));
  check("checks", packet.includes("factory-check · pass · 40873984441") && packet.includes("verify:click-attribution · pass · 40873984426"));
  check("release draft", packet.includes("draft"));
  check("no integration sha", packet.includes("none"));
  check("manual", packet.includes("Manual · not live"));
  check("systems change not on glass", !packet.includes("This file is the systems-change packet."));
  check("release eligible not on glass", !packet.includes("Release eligible"));

  await clickText(page, "← Tower");
  await clickText(page, "Launch Agent");
  await page.waitForFunction(() => document.body.innerText.includes("Factory production path is not the Launch Agent build."));
  const blocked = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("blocked reason", blocked.includes("Factory production path is not the Launch Agent build."));
  check("not the manifest blocker", !blocked.includes("Factory production path is not authorized"));
  check("no packet", blocked.includes("0") || blocked.includes("—"));
  check("stage stays discovered", blocked.includes("Discovered"));

  await clickText(page, "← Tower");
  await clickText(page, "Graph");
  await page.waitForSelector("[data-testid=graph]");
  const nodes = await page.$$eval("[data-testid^=node-]", (list) => list.map((node) => node.getAttribute("data-testid")));
  check("graph nodes", nodes.length === 3, nodes.join(","));
  const contains = await page.$$("[data-testid=contains-edge]");
  const depends = await page.$$("[data-testid=depends-edge]");
  check("contains edge", contains.length === 1);
  check("depends edge", depends.length === 1);
  await page.screenshot({ path: "/tmp/desk-graph-light.png" });

  await clickText(page, "Filter");
  await clickText(page, "Add");
  await page.waitForFunction(() => document.body.innerText.includes("Type is Initiative"));
  const filtered = await page.$$eval("[data-testid^=node-]", (list) => list.map((node) => node.getAttribute("data-testid")));
  const containsAfter = await page.$$("[data-testid=contains-edge]");
  const dependsAfter = await page.$$("[data-testid=depends-edge]");
  check("filtered nodes", filtered.length === 2 && !filtered.some((id) => id.includes("pkt-001")), filtered.join(","));
  check("filtered edges", containsAfter.length === 0 && dependsAfter.length === 1);

  const lightBg = await page.$eval(".ant-layout-header", (node) => getComputedStyle(node).backgroundColor);
  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  const darkBg = await page.$eval(".ant-layout-header", (node) => getComputedStyle(node).backgroundColor);
  check("dark differs", lightBg !== darkBg, `${lightBg} -> ${darkBg}`);
  const still = await page.$$eval("[data-testid^=node-]", (list) => list.length);
  check("dark keeps pages", still === 2);

  await page.screenshot({ path: "/tmp/desk-graph-dark.png" });
  await clickText(page, "Table");
  await page.evaluate(() => {
    const tag = [...document.querySelectorAll(".ant-tag")].find((node) => node.textContent?.includes("Type is Initiative"));
    const button = tag?.querySelector("button, .ant-tag-close-icon, .anticon-close");
    if (button instanceof HTMLElement) button.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("3 pages"));
  await page.screenshot({ path: "/tmp/desk-table-dark.png" });

  const flag = process.env.TOWER_FAIL_FLAG;
  if (flag) {
    await writeFile(flag, "1\n");
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForSelector("[data-testid=read-failed]");
    const failed = await page.evaluate(() => document.body.innerText);
    check("read failed keeps rows", failed.includes("read failed") && failed.includes("3 pages") && failed.includes("Launch Agent"));
    await page.screenshot({ path: "/tmp/desk-read-failed.png" });
    await writeFile(flag, "0\n");
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => !document.querySelector("[data-testid=read-failed]"));
  } else {
    await page.click(".ant-switch");
    await page.waitForFunction(() => document.body.innerText.includes("Light"));
  }

  await clickText(page, "Which execution a result belongs to");
  await page.screenshot({ path: "/tmp/desk-initiative-light.png" });
} finally {
  if (process.env.TOWER_FAIL_FLAG) await writeFile(process.env.TOWER_FAIL_FLAG, "0\n");
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
